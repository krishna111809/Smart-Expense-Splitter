// backend/utils/permissions.js

// Function to check if a user is a member of a given group
const isMemberOf = (group, userId) => {
  if (!group || !Array.isArray(group.members) || !userId) return false;
  return group.members.some(m => m && m.userId && (String(m.userId) === String(userId)));
};
module.exports = { isMemberOf };