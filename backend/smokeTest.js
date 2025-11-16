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
const password = 'Test@1234';

const client = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  validateStatus: () => true
});

async function run() {
  console.log('Base URL:', BASE_URL);

  // 1) Health check
  console.log('\n1) Health check...');
  let res = await client.get('/health');
  if (res.status === 200 && res.data && res.data.ok) {
    console.log('  ✔ Health OK');
  } else {
    console.error('  ✖ Health failed', res.status, res.data);
    return process.exit(1);
  }

  // 2) Register owner
  console.log('\n2) Register owner user ->', ownerEmail);
  res = await client.post('/api/auth/register', { name: 'Owner', email: ownerEmail, password });
  if (![200,201].includes(res.status)) {
    console.error('  ✖ Owner register failed', res.status, res.data);
    return process.exit(1);
  }
  console.log('  ✔ Registered owner');

  // 3) Register member
  console.log('\n3) Register member user ->', memberEmail);
  res = await client.post('/api/auth/register', { name: 'Member', email: memberEmail, password });
  if (![200,201].includes(res.status)) {
    console.error('  ✖ Member register failed', res.status, res.data);
    return process.exit(1);
  }
  console.log('  ✔ Registered member');

  // 4) Login owner
  console.log('\n4) Login owner...');
  res = await client.post('/api/auth/login', { email: ownerEmail, password });
  if (res.status !== 200 || !res.data.token) {
    console.error('  ✖ Owner login failed', res.status, res.data);
    return process.exit(1);
  }
  const ownerToken = res.data.token;
  const ownerId = res.data.user?.id;
  console.log('  ✔ Owner logged in. id=', ownerId);

  // 5) Login member (to get id)
  console.log('\n5) Login member...');
  res = await client.post('/api/auth/login', { email: memberEmail, password });
  if (res.status !== 200 || !res.data.token) {
    console.error('  ✖ Member login failed', res.status, res.data);
    return process.exit(1);
  }
  const memberToken = res.data.token;
  const memberId = res.data.user?.id;
  console.log('  ✔ Member logged in. id=', memberId);

  // 6) GET /api/auth/me (owner)
  console.log('\n6) GET /api/auth/me (owner)...');
  res = await client.get('/api/auth/me', { headers: { Authorization: `Bearer ${ownerToken}` }});
  if (res.status === 200 && res.data.user && res.data.user.email === ownerEmail) {
    console.log('  ✔ /me OK');
  } else {
    console.error('  ✖ /me failed', res.status, res.data);
    return process.exit(1);
  }

  // 7) Create group (owner)
  console.log('\n7) Create group (owner)...');
  res = await client.post('/api/groups', { name: 'SmokeTestGroup', description: 'temp group' }, { headers: { Authorization: `Bearer ${ownerToken}` }});
  if (![200,201].includes(res.status) || !res.data.group) {
    console.error('  ✖ Create group failed', res.status, res.data);
    return process.exit(1);
  }
  const group = res.data.group;
  console.log('  ✔ Group created. id=', group._id);

  // 8) Add member to group (owner)
  console.log('\n8) Add member to group (owner adds member)...');
  res = await client.post(`/api/groups/${group._id}/members`, { memberUserId: memberId, displayName: 'Member' }, { headers: { Authorization: `Bearer ${ownerToken}` }});
  if (res.status !== 200 || !res.data.group) {
    console.error('  ✖ Add member failed', res.status, res.data);
    return process.exit(1);
  }
  console.log('  ✔ Member added to group');

  // 9) Create expense (owner) - use CUSTOM split and sum shares to amount
  console.log('\n9) Create expense (owner)...');
  const amount = 1000;
  const participants = [
    { userId: ownerId, share: amount * 0.6 },
    { userId: memberId, share: amount * 0.4 }
  ];
  const expensePayload = {
    groupId: group._id,
    title: 'SmokeTestExpense',
    amount,
    paidBy: ownerId,
    splitType: 'CUSTOM',
    participants,
    category: 'Test'
  };
  res = await client.post('/api/expenses', expensePayload, { headers: { Authorization: `Bearer ${ownerToken}` }});
  if (![200,201].includes(res.status) || !res.data.expense) {
    console.error('  ✖ Create expense failed', res.status, res.data);
    return process.exit(1);
  }
  const expense = res.data.expense;
  console.log('  ✔ Expense created. id=', expense._id);

  // 10) List expenses for group (member)
  console.log('\n10) List expenses (member)...');
  res = await client.get(`/api/expenses?groupId=${group._id}`, { headers: { Authorization: `Bearer ${memberToken}` }});
  if (res.status === 200 && Array.isArray(res.data.expenses)) {
    console.log('  ✔ Expenses listed. count=', res.data.expenses.length);
  } else {
    console.error('  ✖ List expenses failed', res.status, res.data);
    return process.exit(1);
  }

  // 11) Get single expense
  console.log('\n11) Get single expense (member)...');
  res = await client.get(`/api/expenses/${expense._id}`, { headers: { Authorization: `Bearer ${memberToken}` }});
  if (res.status === 200 && res.data.expense && res.data.expense._id === expense._id) {
    console.log('  ✔ Get expense OK');
  } else {
    console.error('  ✖ Get expense failed', res.status, res.data);
    return process.exit(1);
  }

  console.log('\nALL TESTS PASSED ✅');
  process.exit(0);
}

run().catch(err => {
  console.error('Unexpected error', err && err.response ? err.response.data : err.message || err);
  process.exit(1);
});
