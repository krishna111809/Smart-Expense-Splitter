// backend/smokeTest.js
// Simple smoke test script for the Smart Expense Splitter backend API.
// This script performs a series of API calls to verify basic functionality:
// - User registration and login
// - Group creation and member management
// - Expense creation, listing, and deletion
// Usage:
//   npm install axios
//   BASE_URL=http://localhost:3000 node smokeTest.js
//
// env opts:
//   PASSWORD (default Test@1234)
//   RETRY_COUNT (default 1)

const axios = require('axios');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const rand = () => Math.floor(Math.random() * 1e6);
const ownerEmail = `smoketest-owner+${rand()}@example.com`;
const memberEmail = `smoketest-member+${rand()}@example.com`;
const otherEmail = `smoketest-other+${rand()}@example.com`;
const password = process.env.PASSWORD || 'Test@1234';

const RETRY_COUNT = Number(process.env.RETRY_COUNT || 1);
const DELAY_MS = Number(process.env.DELAY_MS || 200);
const CONTINUE_ON_ERROR = (process.env.CONTINUE_ON_ERROR || 'false') === 'true';
const VERBOSE = (process.env.VERBOSE || 'true') === 'true';

const client = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  validateStatus: () => true,
  timeout: 15000,
});

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function logResponse(label, res) {
  if (!VERBOSE) return;
  console.log(`\n--- ${label} ---`);
  console.log('Status:', res?.status);
  try { console.log('Body:', JSON.stringify(res?.data, null, 2)); }
  catch { console.log('Body:', res?.data); }
  console.log('-----------------------\n');
}

function fail(msg, res) {
  const err = { kind: 'FAIL', message: msg, detail: res?.data || res };
  throw err;
}

async function withRetries(fn, label) {
  let lastErr;
  for (let attempt = 1; attempt <= RETRY_COUNT; attempt++) {
    try {
      const res = await fn();
      return res;
    } catch (e) {
      lastErr = e;
      console.warn(`${label} attempt ${attempt} failed:`, e.message || e);
      if (attempt < RETRY_COUNT) await sleep(200);
    }
  }
  throw lastErr;
}

function extractId(obj) {
  if (!obj) return null;
  if (typeof obj === 'string') return obj;
  return obj.id || obj._id || (obj.user && (obj.user.id || obj.user._id)) || (obj.data && (obj.data.id || obj.data._id)) || null;
}

async function register(name, email) {
  return withRetries(() => client.post('/api/auth/register', { name, email, password }), `register ${email}`);
}

async function login(email, pass = password) {
  return withRetries(() => client.post('/api/auth/login', { email, password: pass }), `login ${email}`);
}

async function authGet(path, token) { return client.get(path, { headers: token ? { Authorization: `Bearer ${token}` } : {} }); }
async function authPost(path, body, token) { return client.post(path, body, { headers: token ? { Authorization: `Bearer ${token}` } : {} }); }
async function authPut(path, body, token) { return client.put(path, body, { headers: token ? { Authorization: `Bearer ${token}` } : {} }); }
async function authDelete(path, body, token) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  if (body === null || body === undefined) {
    return client.delete(path, { headers });
  }
  return client.delete(path, { data: body, headers });
}


async function runStep(stepFn, name) {
  try {
    const res = await stepFn();
    return { name, ok: true, res };
  } catch (err) {
    const message = (err && err.message) || JSON.stringify(err);
    console.error(`STEP FAILED: ${name} ->`, message);
    if (!CONTINUE_ON_ERROR) throw err;
    return { name, ok: false, err };
  }
}

async function run() {
  console.log('Base URL:', BASE_URL);
  const failures = [];

  // HEALTH
  let r = await runStep(async () => {
    const res = await client.get('/health');
    logResponse('Health Check', res);
    if (res.status !== 200) fail('health not OK', res);
    return res;
  }, 'Health Check');
  if (!r.ok) failures.push(r);

  // Register users
  for (const [label, email] of [['Owner', ownerEmail], ['Member', memberEmail], ['Other', otherEmail]]) {
    const res = await runStep(async () => {
      const resp = await register(label, email);
      logResponse(`Register ${email}`, resp);
      if (![200,201,400,409].includes(resp.status)) fail('unexpected status', resp);
      return resp;
    }, `Register ${email}`);
    if (!res.ok) failures.push(res);
    await sleep(DELAY_MS);
  }

  // Logins
  const ownerLogin = await runStep(async () => {
    const resp = await login(ownerEmail);
    logResponse(`Login ${ownerEmail}`, resp);
    if (resp.status !== 200) fail('owner login failed', resp);
    return resp;
  }, 'Login Owner');
  if (!ownerLogin.ok) failures.push(ownerLogin);

  const memberLogin = await runStep(async () => {
    const resp = await login(memberEmail);
    logResponse(`Login ${memberEmail}`, resp);
    if (resp.status !== 200) fail('member login failed', resp);
    return resp;
  }, 'Login Member');
  if (!memberLogin.ok) failures.push(memberLogin);

  const otherLogin = await runStep(async () => {
    const resp = await login(otherEmail).catch(() => ({ status: 0 }));
    logResponse(`Login ${otherEmail}`, resp);
    return resp;
  }, 'Login Other');

  const ownerToken = ownerLogin.ok ? ownerLogin.res.data?.token : null;
  const memberToken = memberLogin.ok ? memberLogin.res.data?.token : null;
  const ownerId = ownerLogin.ok ? extractId(ownerLogin.res.data?.user || ownerLogin.res.data) : null;
  const memberId = memberLogin.ok ? extractId(memberLogin.res.data?.user || memberLogin.res.data) : null;
  const otherId = otherLogin.ok ? extractId(otherLogin.res.data?.user || otherLogin.res.data) : null;

  // /me without token -> 401
  const meNoToken = await runStep(async () => {
    const resp = await authGet('/api/auth/me', null);
    logResponse('/auth/me (no token)', resp);
    if (resp.status === 200) fail('Expected /api/auth/me to be unauthorized without token', resp);
    return resp;
  }, '/auth/me (no token)');
  if (!meNoToken.ok) failures.push(meNoToken);

  // /me with token
  const meWithToken = await runStep(async () => {
    const resp = await authGet('/api/auth/me', ownerToken);
    logResponse('/auth/me (token)', resp);
    if (resp.status !== 200) fail('/me failed', resp);
    return resp;
  }, '/auth/me (token)');
  if (!meWithToken.ok) failures.push(meWithToken);

  // Create group (owner)
  const createGroup = await runStep(async () => {
    const resp = await authPost('/api/groups', { name: 'SmokeTestGroup', description: 'temp group' }, ownerToken);
    logResponse('Create Group', resp);
    if (![200,201].includes(resp.status)) fail('create group failed', resp);
    return resp;
  }, 'Create Group');
  if (!createGroup.ok) failures.push(createGroup);

  const groupObj = createGroup.ok ? (createGroup.res.data.group || createGroup.res.data) : null;
  const groupId = extractId(groupObj);

  // Owner gets groups
  const ownerGroups = await runStep(async () => {
    const resp = await authGet('/api/groups', ownerToken);
    logResponse('Owner Groups', resp);
    if (resp.status !== 200) fail('owner groups failed', resp);
    return resp;
  }, 'Owner Groups');
  if (!ownerGroups.ok) failures.push(ownerGroups);

  // Member groups should not contain group yet
  const memberGroupsBefore = await runStep(async () => {
    const resp = await authGet('/api/groups', memberToken);
    logResponse('Member Groups (before add)', resp);
    if (resp.status !== 200) fail('member groups failed', resp);
    return resp;
  }, 'Member Groups (before add)');
  if (!memberGroupsBefore.ok) failures.push(memberGroupsBefore);

  // Add member (owner)
  const addMember = await runStep(async () => {
    const resp = await authPost(`/api/groups/${groupId}/members`, { memberUserId: memberId, displayName: 'Member' }, ownerToken);
    logResponse('Add Member', resp);
    if (![200,201].includes(resp.status)) fail('add member failed', resp);
    return resp;
  }, 'Add Member');
  if (!addMember.ok) failures.push(addMember);

  // Add member by non-owner should fail
  const addMemberByNonOwner = await runStep(async () => {
    const resp = await authPost(`/api/groups/${groupId}/members`, { memberUserId: otherId, displayName: 'Other' }, memberToken);
    logResponse('Add member by non-owner', resp);
    if (resp.status === 200) fail('Expected non-owner add member to fail', resp);
    return resp;
  }, 'Add member by non-owner');
  if (!addMemberByNonOwner.ok) failures.push(addMemberByNonOwner);

  // Member should see group now
  const memberGroupsAfter = await runStep(async () => {
    const resp = await authGet('/api/groups', memberToken);
    logResponse('Member Groups (after add)', resp);
    if (resp.status !== 200) fail('member groups after add failed', resp);
    return resp;
  }, 'Member Groups (after add)');
  if (!memberGroupsAfter.ok) failures.push(memberGroupsAfter);

  // Create a valid expense (CUSTOM) by owner
  const amount = 1000;
  const participants = [{ userId: ownerId, share: amount * 0.6 }, { userId: memberId, share: amount * 0.4 }];
  const createExpense = await runStep(async () => {
    const resp = await authPost('/api/expenses', {
      groupId, title: 'SmokeTestExpense', amount, paidBy: ownerId, splitType: 'CUSTOM', participants, category: 'Test'
    }, ownerToken);
    logResponse('Create Expense (valid)', resp);
    if (![200,201].includes(resp.status)) fail('create expense failed', resp);
    return resp;
  }, 'Create Expense');
  if (!createExpense.ok) failures.push(createExpense);

  const expenseObj = createExpense.ok ? (createExpense.res.data.expense || createExpense.res.data) : null;
  const expenseId = extractId(expenseObj);

  // List expenses with groupId (member)
  const listWithGroup = await runStep(async () => {
    const resp = await authGet(`/api/expenses?groupId=${groupId}`, memberToken);
    logResponse('List Expenses (with groupId)', resp);
    if (resp.status !== 200) fail('list expenses failed', resp);
    return resp;
  }, 'List Expenses (with groupId)');
  if (!listWithGroup.ok) failures.push(listWithGroup);

  // Verify created expense present
  try {
    const listed = listWithGroup.ok ? (listWithGroup.res.data.expenses || listWithGroup.res.data) : null;
    const found = Array.isArray(listed) ? listed.some(e => (e._id || e.id) === expenseId) : false;
    if (!found) throw new Error('Expected created expense to appear in list');
  } catch (e) {
    const r = { name: 'Verify expense in list', ok: false, err: e };
    console.error('Verify expense in list failed:', e.message);
    if (!CONTINUE_ON_ERROR) throw e;
    failures.push(r);
  }

  // Get single expense as member
  const getExpense = await runStep(async () => {
    const resp = await authGet(`/api/expenses/${expenseId}`, memberToken);
    logResponse('Get single expense', resp);
    if (resp.status !== 200) fail('get expense failed', resp);
    return resp;
  }, 'Get single expense');
  if (!getExpense.ok) failures.push(getExpense);

  // Update member displayName (owner)
  const updateMember = await runStep(async () => {
    const resp = await authPut(`/api/groups/${groupId}/members`, { memberUserId: memberId, displayName: 'UpdatedMember' }, ownerToken);
    logResponse('Update member (owner)', resp);
    if (resp.status !== 200) fail('update member failed', resp);
    return resp;
  }, 'Update member');
  if (!updateMember.ok) failures.push(updateMember);

  // Verify updated member name
  try {
    const resp = await authGet(`/api/groups/${groupId}`, memberToken);
    logResponse('Verify updated member', resp);
    if (resp.status !== 200) throw new Error('Failed fetching group after update');
    const updatedGroup = resp.data.group || resp.data;
    const updatedMember = (updatedGroup.members || []).find(m => (m.userId && (m.userId._id || m.userId)) === memberId || (m.userId === memberId));
    if (!updatedMember || updatedMember.displayName !== 'UpdatedMember') throw new Error('Member displayName was not updated');
  } catch (e) {
    const r = { name: 'Verify updated member name', ok: false, err: e };
    console.error('Verify updated member name failed:', e.message);
    if (!CONTINUE_ON_ERROR) throw e;
    failures.push(r);
  }

  // Delete member (owner) using path param
  const deleteMember = await runStep(async () => {
    const resp = await authDelete(`/api/groups/${groupId}/members/${memberId}`, null, ownerToken);
    logResponse('Delete member (owner)', resp);
    if (resp.status !== 200) fail('delete member failed', resp);
    return resp;
  }, 'Delete member');
  if (!deleteMember.ok) failures.push(deleteMember);

  // Member should no longer see udGroup (we created only one group earlier; check it removed)
  const memberGroupsFinal = await runStep(async () => {
    const resp = await authGet('/api/groups', memberToken);
    logResponse('Member Groups (after delete)', resp);
    if (resp.status !== 200) fail('member groups after delete failed', resp);
    return resp;
  }, 'Member Groups (after delete)');
  if (!memberGroupsFinal.ok) failures.push(memberGroupsFinal);

  // Delete created expense (owner)
  const deleteExpense = await runStep(async () => {
    const resp = await authDelete(`/api/expenses/${expenseId}`, null, ownerToken);
    logResponse('Delete expense', resp);
    if (resp.status !== 200) fail('delete expense failed', resp);
    return resp;
  }, 'Delete expense');
  if (!deleteExpense.ok) failures.push(deleteExpense);

  // Delete group (owner)
  const deleteGroupOwner = await runStep(async () => {
    const resp = await authDelete(`/api/groups/${groupId}`, null, ownerToken);
    logResponse('Delete group (owner)', resp);
    if (resp.status !== 200) fail('delete group failed', resp);
    return resp;
  }, 'Delete group (owner)');
  if (!deleteGroupOwner.ok) failures.push(deleteGroupOwner);

  // Final summary
  console.log('\n\nSMOKE TEST SUMMARY');
  if (failures.length === 0) {
    console.log('ALL TESTS PASSED ✅');
    process.exit(0);
  } else {
    console.error(`${failures.length} step(s) failed:`);
    failures.forEach((f, i) => {
      console.error(`${i + 1}. ${f.name} -> ${f.ok === false ? (f.err?.message || JSON.stringify(f.err)) : 'failed'}`);
    });
    if (!CONTINUE_ON_ERROR) process.exit(1);
    process.exit(0);
  }
}

run().catch(err => {
  console.error('UNEXPECTED ERROR:', err?.message || err);
  process.exit(1);
});