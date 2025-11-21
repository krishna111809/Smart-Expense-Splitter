// backend/controllers/expenseController.js
const { Expense, Group } = require('../models');
const { isMemberOf } = require('../utils/permissions');
const { validationResult } = require('express-validator');

// Add expense - allow any member to add an expense to the group
exports.addExpense = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ msg: 'Unauthorized' });

    const { groupId, title, amount, paidBy, splitType, category, date, notes } = req.body;
    // make participants mutable because we may compute shares for EQUAL
    let participants = req.body.participants;

    if (!groupId || !title || amount === undefined || !paidBy || !splitType || !participants) {
      return res.status(400).json({ msg: 'Missing required fields' });
    }

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ msg: 'Group not found' });

    if (!isMemberOf(group, userId)) return res.status(403).json({ msg: 'Not a member' });

    if (!isMemberOf(group, paidBy)) return res.status(400).json({ msg: 'paidBy must be a group member' });

    if (splitType === 'EQUAL') {
      const count = participants.length;
      if (count === 0) return res.status(400).json({ msg: 'At least one participant required for EQUAL split' });
      const base = Number((amount / count).toFixed(2));
      const participantsWithShares = participants.map((p, idx) => {
        return { userId: p.userId, share: base };
      });
      // rounding by adjusting last participant
      const sumBase = base * count;
      const remainder = Number((amount - sumBase).toFixed(2));
      participantsWithShares[count - 1].share = Number((participantsWithShares[count - 1].share + remainder).toFixed(2));
      // use computed participants from now on
      participants = participantsWithShares;
    }

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
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ msg: 'Unauthorized' });

    const { groupId } = req.query;
    if (!groupId) return res.status(400).json({ msg: 'groupId query required' });

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ msg: 'Group not found' });

    if (!isMemberOf(group, userId)) return res.status(403).json({ msg: 'Not a member' });

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
    const userId = req.userId;
    if (!userId) return res.status(401).json({ msg: 'Unauthorized' });

    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ msg: 'Not found' });

    const group = await Group.findById(expense.groupId);
    if (!group) return res.status(404).json({ msg: 'Group not found' });

    if (!isMemberOf(group, userId)) return res.status(403).json({ msg: 'Not a member' });

    res.json({ expense });
  } catch (err) {
    console.error('getExpense err', err.message || err);
    res.status(500).json({ msg: err.message || 'Error' });
  }
};

// delete expense - allow owner OR expense.paidBy to delete
exports.deleteExpense = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ msg: 'Unauthorized' });

    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ msg: 'Not found' });

    const group = await Group.findById(expense.groupId);
    if (!group) return res.status(404).json({ msg: 'Group not found' });

    // membership check
    if (!isMemberOf(group, userId)) return res.status(403).json({ msg: 'Not a member' });

    // allow deletion only by group owner or the user who paid
    if (String(group.owner) !== String(userId) && String(expense.paidBy) !== String(userId)) {
      return res.status(403).json({ msg: 'Only owner or payer can delete expense' });
    }

    await Expense.deleteOne({ _id: req.params.id });
    res.json({ msg: 'Expense deleted' });
  } catch (err) {
    console.error('deleteExpense err', err.message || err);
    res.status(500).json({ msg: err.message || 'Error' });
  }
};

// modify expense - allow owner OR expense.paidBy to modify
exports.modifyExpense = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ msg: 'Unauthorized' });

    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ msg: 'Not found' });

    const group = await Group.findById(expense.groupId);
    if (!group) return res.status(404).json({ msg: 'Group not found' });

    if (!isMemberOf(group, userId)) return res.status(403).json({ msg: 'Not a member' });

    // allow modify only by owner or the payer
    if (String(group.owner) !== String(userId) && String(expense.paidBy) !== String(userId)) {
      return res.status(403).json({ msg: 'Only owner or payer can modify expense' });
    }

    let { title, amount, paidBy, splitType, participants, category, date, notes } = req.body;

    if (title !== undefined) expense.title = title;
    if (amount !== undefined) expense.amount = amount;
    if (paidBy !== undefined) {
      // ensure new paidBy is a group member
      if (!isMemberOf(group, paidBy)) return res.status(400).json({ msg: 'paidBy must be a group member' });
      expense.paidBy = paidBy;
    }
    if (splitType !== undefined) expense.splitType = splitType;
    if (participants !== undefined) expense.participants = participants;
    if (category !== undefined) expense.category = category;
    if (date !== undefined) expense.date = new Date(date);
    if (notes !== undefined) expense.notes = notes;

    // If final splitType is EQUAL (either provided or already present), ensure participants have shares
    const finalSplitType = expense.splitType;
    if (finalSplitType === 'EQUAL') {
      const parts = expense.participants || [];
      const count = parts.length;
      if (count === 0) return res.status(400).json({ msg: 'At least one participant required for EQUAL split' });
      const base = Number((expense.amount / count).toFixed(2));
      const participantsWithShares = parts.map(p => ({ userId: p.userId, share: base }));
      const sumBase = base * count;
      const remainder = Number((expense.amount - sumBase).toFixed(2));
      participantsWithShares[count - 1].share = Number((participantsWithShares[count - 1].share + remainder).toFixed(2));
      expense.participants = participantsWithShares;
    }

    await expense.save();
    res.json({ msg: 'Expense updated', expense });
  } catch (err) {
    console.error('editExpense err', err.message || err);
    res.status(500).json({ msg: err.message || 'Error' });
  }
};
