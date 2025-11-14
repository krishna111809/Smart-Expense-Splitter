const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');

// add expense
router.post('/', expenseController.addExpense);

// list group expenses
router.get('/', expenseController.listExpenses);

// get single expense
router.get('/:id', expenseController.getExpense);

module.exports = router;
