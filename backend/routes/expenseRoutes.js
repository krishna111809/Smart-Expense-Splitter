const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const authMiddleware = require('../utils/authMiddleware');

// add expense
router.post('/', authMiddleware, expenseController.addExpense);

// list group expenses
router.get('/', authMiddleware, expenseController.listExpenses);

// get single expense
router.get('/:id', authMiddleware, expenseController.getExpense);

module.exports = router;
