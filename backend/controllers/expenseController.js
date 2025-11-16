const { Expense, Group } = require('../models');
const { getUserIdFromReq } = require('../utils/auth');

// Add expense
exports.addExpense = async (req, res) => {
  try {
    const userId = req.userId || getUserIdFromReq(req);
    const { groupId, title, amount, paidBy, splitType, participants, category, date, notes } = req.body;

    if (!groupId || !title || !amount || !paidBy || !splitType || !participants) {
      return res.status(400).json({ msg: 'Missing required fields' });
    }

    // basic group membership check
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ msg: 'Group not found' });

    const isMember = group.members.some(m => m.userId && (m.userId._id ? m.userId._id.toString() === userId : m.userId.toString() === userId));
    if (!isMember) return res.status(403).json({ msg: 'Not a member' });

    const expense = new Expense({
      groupId,
      title,
      amount,
      paidBy,
      splitType,
      participants,
      category: category || 'General',
      date: date ? new Date(date) : new Date(),
      notes: notes || ''
    });

    await expense.save();
    res.status(201).json({ msg: 'Expense added', expense });
  } catch (err) {
    console.error('addExpense err', err.message || err);
    res.status(500).json({ msg: err.message || 'Error' });
  }
};

// list expenses (filter by groupId query)
exports.listExpenses = async (req, res) => {
  try {
    const userId = req.userId || getUserIdFromReq(req);
    const { groupId } = req.query;
    if (!groupId) return res.status(400).json({ msg: 'groupId query required' });

    // membership check
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ msg: 'Group not found' });

    const isMember = group.members.some(m => m.userId && (m.userId._id ? m.userId._id.toString() === userId : m.userId.toString() === userId));
    if (!isMember) return res.status(403).json({ msg: 'Not a member' });

    const expenses = await Expense.find({ groupId }).sort({ date: -1 });
    res.json({ expenses });
  } catch (err) {
    console.error('listExpenses err', err.message || err);
    res.status(500).json({ msg: err.message || 'Error' });
  }
};

// get single expense
exports.getExpense = async (req, res) => {
  try {
    const userId = req.userId || getUserIdFromReq(req);
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ msg: 'Not found' });

    const group = await Group.findById(expense.groupId);
    const isMember = group.members.some(m => m.userId && (m.userId._id ? m.userId._id.toString() === userId : m.userId.toString() === userId));
    if (!isMember) return res.status(403).json({ msg: 'Not a member' });

    res.json({ expense });
  } catch (err) {
    console.error('getExpense err', err.message || err);
    res.status(500).json({ msg: err.message || 'Error' });
  }
};
