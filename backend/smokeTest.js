// Extended smokeTest.js - comprehensive checks including error handling
// Usage:
//   1) npm install axios
//   2) node smokeTest.js
//
// Optionally set BASE_URL env: BASE_URL=http://localhost:3000 node smokeTest.js

const axios = require('axios');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const rand = () => Math.floor(Math.random() * 1e6);
const ownerEmail = `smoketest-owner+${rand()}@example.com`;
const memberEmail = `smoketest-member+${rand()}@example.com`;
const otherEmail = `smoketest-other+${rand()}@example.com`;
const password = 'Test@1234';

const client = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  validateStatus: () => true
});

function logResponse(label, res) {
  console.log(`\n--- ${label} ---`);
  console.log("Status:", res.status);
  try { console.log("Body:", JSON.stringify(res.data, null, 2)); }
  catch { console.log("Body:", res.data); }
  console.log("-----------------------\n");
}

async function expect(res, statusList = [200]) {
  if (!Array.isArray(statusList)) statusList = [statusList];
  if (!statusList.includes(res.status)) {
    console.error('Unexpected status', res.status, 'expected', statusList);
    logResponse('FAIL DETAIL', res);
    process.exit(1);
  }
}

async function run() {
  console.log('Base URL:', BASE_URL);

  // 1) Health check
  let res = await client.get('/health');
  logResponse("Health Check", res);
  await expect(res, [200]);

  // 2) Register owner
  res = await client.post('/api/auth/register', { name: 'Owner', email: ownerEmail, password });
  logResponse("Register Owner", res);
  await expect(res, [200,201]);

  // 3) Register member
  res = await client.post('/api/auth/register', { name: 'Member', email: memberEmail, password });
  logResponse("Register Member", res);
  await expect(res, [200,201]);

  // 4) Duplicate register should return 400 (email already used)
  res = await client.post('/api/auth/register', { name: 'Owner2', email: ownerEmail, password });
  logResponse("Register Duplicate Owner", res);
  if (res.status !== 400) { console.error('Expected 400 on duplicate register'); process.exit(1); }

  // 5) Register another user (other)
  res = await client.post('/api/auth/register', { name: 'Other', email: otherEmail, password });
  logResponse("Register Other", res);
  await expect(res, [200,201]);
  const otherId = res.data.user?.id;

  // 6) Invalid login should fail
  res = await client.post('/api/auth/login', { email: ownerEmail, password: 'wrongpass' });
  logResponse("Invalid Login", res);
  if (res.status === 200) { console.error('Expected login failure with wrong password'); process.exit(1); }

  // 7) Login owner
  res = await client.post('/api/auth/login', { email: ownerEmail, password });
  logResponse("Login Owner", res);
  await expect(res, 200);
  const ownerToken = res.data.token;
  const ownerId = res.data.user?.id;

  // 8) Login member
  res = await client.post('/api/auth/login', { email: memberEmail, password });
  logResponse("Login Member", res);
  await expect(res, 200);
  const memberToken = res.data.token;
  const memberId = res.data.user?.id;

  // 9) GET /api/auth/me without token should be 401
  res = await client.get('/api/auth/me');
  logResponse("GET /me without token", res);
  if (res.status === 200) { console.error('Expected unauthorized without token'); process.exit(1); }

  // 10) GET /api/auth/me with owner token
  res = await client.get('/api/auth/me', { headers: { Authorization: `Bearer ${ownerToken}` }});
  logResponse("GET /me (Owner)", res);
  await expect(res, 200);

  // 11) Create group (owner)
  res = await client.post('/api/groups', { name: 'SmokeTestGroup', description: 'temp group' }, { headers: { Authorization: `Bearer ${ownerToken}` }});
  logResponse("Create Group", res);
  await expect(res, [200,201]);
  const group = res.data.group || res.data;
  if (!group || !group._id) { console.error('Group creation missing id'); process.exit(1); }
  const groupId = group._id;

  // 12) Add member (owner)
  res = await client.post(`/api/groups/${groupId}/members`, { memberUserId: memberId, displayName: 'Member' }, { headers: { Authorization: `Bearer ${ownerToken}` }});
  logResponse("Add Member to Group", res);
  await expect(res, 200);

  // 13) Add member by non-owner should fail (other user)
  res = await client.post(`/api/groups/${groupId}/members`, { memberUserId: otherId, displayName: 'Other' }, { headers: { Authorization: `Bearer ${memberToken}` }});
  logResponse("Add Member by Non-owner", res);
  if (res.status === 200) { console.error('Expected failure when non-owner adds member'); process.exit(1); }

  // 14) Get group details as member (should succeed)
  res = await client.get(`/api/groups/${groupId}`, { headers: { Authorization: `Bearer ${memberToken}` }});
  logResponse("Get Group (Member)", res);
  await expect(res, 200);

  // 15) Create expense with invalid CUSTOM shares (sum mismatch) -> expect 500/400
  const badParticipantsCustom = [
    { userId: ownerId, share: 10 },
    { userId: memberId, share: 20 }
  ];
  res = await client.post('/api/expenses', {
    groupId,
    title: 'BadCustomExpense',
    amount: 100,
    paidBy: ownerId,
    splitType: 'CUSTOM',
    participants: badParticipantsCustom
  }, { headers: { Authorization: `Bearer ${ownerToken}` }});
  logResponse("Create Expense (Bad CUSTOM shares)", res);
  if (res.status === 201 || res.status === 200) { console.error('Expected validation error for CUSTOM sum mismatch'); process.exit(1); }

  // 16) Create expense with invalid PERCENTAGE shares (sum != 100)
  const badParticipantsPct = [
    { userId: ownerId, share: 60 },
    { userId: memberId, share: 30 }
  ];
  res = await client.post('/api/expenses', {
    groupId,
    title: 'BadPctExpense',
    amount: 200,
    paidBy: ownerId,
    splitType: 'PERCENTAGE',
    participants: badParticipantsPct
  }, { headers: { Authorization: `Bearer ${ownerToken}` }});
  logResponse("Create Expense (Bad PERCENTAGE shares)", res);
  if (res.status === 201 || res.status === 200) { console.error('Expected validation error for PERCENTAGE sum mismatch'); process.exit(1); }

  // 17) Create valid expense (CUSTOM)
  const amount = 1000;
  const participants = [
    { userId: ownerId, share: amount * 0.6 },
    { userId: memberId, share: amount * 0.4 }
  ];
  const payload = {
    groupId,
    title: 'SmokeTestExpense',
    amount,
    paidBy: ownerId,
    splitType: 'CUSTOM',
    participants,
    category: 'Test'
  };
  res = await client.post('/api/expenses', payload, { headers: { Authorization: `Bearer ${ownerToken}` }});
  logResponse("Create Expense (Valid)", res);
  await expect(res, [200,201]);
  const expense = res.data.expense || res.data;
  const expenseId = expense._id || expense.id;

  // 18) List expenses - missing groupId should return 400
  res = await client.get('/api/expenses', { headers: { Authorization: `Bearer ${memberToken}` }});
  logResponse("List Expenses without groupId", res);
  if (res.status === 200) { console.error('Expected 400 when groupId missing'); process.exit(1); }

  // 19) List expenses correctly as member
  res = await client.get(`/api/expenses?groupId=${groupId}`, { headers: { Authorization: `Bearer ${memberToken}` }});
  logResponse("List Expenses (Member)", res);
  await expect(res, 200);

  // 20) Get single expense as member
  res = await client.get(`/api/expenses/${expenseId}`, { headers: { Authorization: `Bearer ${memberToken}` }});
  logResponse("Get Single Expense (Member)", res);
  await expect(res, 200);

  // 21) Get single expense as non-member (other user) should fail
  res = await client.get(`/api/expenses/${expenseId}`, { headers: { Authorization: `Bearer ${otherEmail}` }});
  // Note: otherEmail not a token; expect 401 or 500. We expect not 200.
  logResponse("Get Expense with invalid token header", res);
  if (res.status === 200) { console.error('Expected failure when using invalid token header'); process.exit(1); }

  console.log('\\nALL TESTS PASSED ✅');
  process.exit(0);
}

run().catch(err => {
  console.error('Unexpected error', err?.response?.data || err);
  process.exit(1);
});
