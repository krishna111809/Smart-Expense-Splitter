const { Group, User } = require('../models');
const { getUserIdFromReq } = require('../utils/auth');

// Create group
exports.createGroup = async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    const { name, description, currency } = req.body;
    if (!name) return res.status(400).json({ msg: 'Name required' });

    const group = new Group({
      name,
      description,
      owner: userId,
      members: [{ userId, displayName: req.body.displayName || 'You', role: 'owner' }],
      currency: currency || 'INR'
    });
    await group.save();
    res.status(201).json({ msg: 'Group created', group });
  } catch (err) {
    console.error('createGroup err', err.message || err);
    res.status(401).json({ msg: err.message || 'Error' });
  }
};

// Get groups for current user
exports.getMyGroups = async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    const groups = await Group.find({ 'members.userId': userId }).sort({ updatedAt: -1 });
    res.json({ groups });
  } catch (err) {
    console.error('getMyGroups err', err.message || err);
    res.status(401).json({ msg: err.message || 'Error' });
  }
};

// Add member
exports.addMember = async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    const { groupId } = req.params;
    const { memberUserId, displayName } = req.body;
    if (!memberUserId) return res.status(400).json({ msg: 'memberUserId required' });

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ msg: 'Group not found' });

    if (group.owner.toString() !== userId) return res.status(403).json({ msg: 'Only owner can add members' });

    // avoid duplicates
    if (group.members.find(m => m.userId.toString() === memberUserId)) return res.status(400).json({ msg: 'Already a member' });

    const user = await User.findById(memberUserId);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    group.members.push({ userId: memberUserId, displayName: displayName || user.name, role: 'member' });
    await group.save();
    res.json({ msg: 'Member added', group });
  } catch (err) {
    console.error('addMember err', err.message || err);
    res.status(401).json({ msg: err.message || 'Error' });
  }
};

// Get group details
exports.getGroup = async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    const { groupId } = req.params;
    const group = await Group.findById(groupId).populate('members.userId', 'name email');
    if (!group) return res.status(404).json({ msg: 'Group not found' });

    // ensure requester is a member
    if (!group.members.find(m => m.userId._id.toString() === userId)) return res.status(403).json({ msg: 'Not a member' });

    res.json({ group });
  } catch (err) {
    console.error('getGroup err', err.message || err);
    res.status(401).json({ msg: err.message || 'Error' });
  }
};
