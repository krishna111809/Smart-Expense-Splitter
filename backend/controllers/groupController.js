// backend/controllers/groupController.js
const { Group, User, Expense } = require('../models');
const { isMemberOf } = require('../utils/permissions');
const { validationResult } = require('express-validator');

// Create group
exports.createGroup = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const userId = req.userId;
    const { name, description, currency } = req.body;

    if (!name) return res.status(400).json({ msg: 'Name required' });

    const user = await User.findById(userId).select('name').lean();
    const ownerDisplay = (user && user.name) ? user.name : (req.body.displayName || 'Owner');

    const group = new Group({
      name,
      description,
      owner: userId,
      members: [{ userId, displayName: ownerDisplay, role: 'owner' }],
      currency: currency || 'INR'
    });

    await group.save();
    res.status(201).json({ msg: 'Group created', group });
  } catch (err) {
    console.error('createGroup err', err.message || err);
    res.status(500).json({ msg: err.message || 'Error' });
  }
};

// Get group details
exports.getGroup = async (req, res) => {
  try {
    const userId = req.userId ;
    const { groupId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ msg: 'Group not found' });

    if (!isMemberOf(group, userId)) return res.status(403).json({ msg: 'Not a member' });

    res.json({ group });
  } catch (err) {
    console.error('getGroup err', err.message || err);
    res.status(500).json({ msg: err.message || 'Error' });
  }
};

// Get groups for current user
exports.getMyGroups = async (req, res) => {
  try {
    const userId = req.userId ;
    const groups = await Group.find({ 'members.userId': userId }).sort({ updatedAt: -1 });

    res.json({ groups });
  } catch (err) {
    console.error('getMyGroups err', err.message || err);
    res.status(500).json({ msg: err.message || 'Error' });
  }
};

// Update group
exports.updateGroup = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const userId = req.userId;
    const { groupId } = req.params;
    const { name, description, currency } = req.body;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ msg: 'Group not found' });
    
    if (group.owner.toString() !== userId) return res.status(403).json({ msg: 'Only owner can update group' });

    if (name) group.name = name;
    if (description) group.description = description;
    if (currency) group.currency = currency;

    await group.save();
    res.json({ msg: 'Group updated', group });
  } catch (err) {
    console.error('updateGroup err', err.message || err);
    res.status(500).json({ msg: err.message || 'Error' });
  }
};

// Delete group
exports.deleteGroup = async (req, res) => {
  try {
    const userId = req.userId;
    const { groupId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ msg: 'Group not found' });
    if (group.owner.toString() !== userId) return res.status(403).json({ msg: 'Only owner can delete group' });

    // Remove related expenses (cascade delete)
    await Expense.deleteMany({ groupId: groupId });

    // Delete the group
    await Group.findByIdAndDelete(groupId);

    res.json({ msg: 'Group and related expenses deleted' });
  } catch (err) {
    console.error('deleteGroup err', err.message || err);
    res.status(500).json({ msg: err.message || 'Error' });
  }
};

// Add member
exports.addMember = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const userId = req.userId;
    const { groupId } = req.params;
    const { memberUserId, displayName, role } = req.body;

    if (!memberUserId) return res.status(400).json({ msg: 'memberUserId required' });

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ msg: 'Group not found' });

    if (group.owner.toString() !== userId) return res.status(403).json({ msg: 'Only owner can add members' });

    const userToAdd = await User.findById(memberUserId).select('_id name').lean();
    if (!userToAdd) return res.status(404).json({ msg: 'User to add not found' });

    const existingMember = group.members.find(m => m.userId.toString() === memberUserId);
    if (existingMember) return res.status(400).json({ msg: 'User is already a member' });

    group.members.push({
      userId: memberUserId,
      displayName: displayName || userToAdd.name || 'New Member',
      role: role || 'member'
    });

    await group.save();
    res.json({ msg: 'Member added', group });
  } catch (err) {
    console.error('addMember err', err.message || err);
    res.status(500).json({ msg: err.message || 'Error' });
  }
};

// Update member
exports.updateMember = async (req, res) => {
  try {
    const userId = req.userId;
    const { groupId } = req.params;
    const { memberUserId, displayName, role } = req.body;

    if (!memberUserId) return res.status(400).json({ msg: 'memberUserId required' });

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ msg: 'Group not found' });

    if (group.owner.toString() !== userId) return res.status(403).json({ msg: 'Only owner can update members' });

    const member = group.members.find(m => m.userId.toString() === memberUserId);
    if (!member) return res.status(404).json({ msg: 'Member not found in group' });

    if (displayName) member.displayName = displayName;
    if (role) member.role = role;

    await group.save();
    res.json({ msg: 'Member updated', group });
  } catch (err) {
    console.error('updateMember err', err.message || err);
    res.status(500).json({ msg: err.message || 'Error' });
  }
};

// Remove member
exports.removeMember = async (req, res) => {
  try {
    const userId = req.userId;
    const { groupId } = req.params;

    const memberUserId = (req.params && req.params.memberId)
      || (req.body && req.body.memberUserId)
      || (req.query && req.query.memberUserId);

    if (!memberUserId) return res.status(400).json({ msg: 'memberUserId required' });

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ msg: 'Group not found' });

    if (group.owner.toString() !== userId) return res.status(403).json({ msg: 'Only owner can remove members' });

    const memberIndex = group.members.findIndex(m => String(m.userId) === String(memberUserId));
    if (memberIndex === -1) return res.status(404).json({ msg: 'Member not found in group' });

    const memberObj = group.members[memberIndex];
    if (String(memberObj.userId) === String(group.owner)) {
      return res.status(400).json({ msg: 'Cannot remove the owner from the group' });
    }

    group.members.splice(memberIndex, 1);
    await group.save();
    res.json({ msg: 'Member removed', group });
  } catch (err) {
    console.error('removeMember err', err.message || err);
    res.status(500).json({ msg: err.message || 'Error' });
  }
};