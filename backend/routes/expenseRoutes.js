// backend/routes/expenseRoutes.js
const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const expenseController = require('../controllers/expenseController');
const authMiddleware = require('../utils/authMiddleware');

// add expense
router.post(
  '/',
  authMiddleware,
  [
    body('groupId').isMongoId().withMessage('groupId required'),
    body('title').trim().notEmpty().withMessage('title required'),
    body('amount').isFloat({ gt: 0 }).withMessage('amount must be > 0'),
    body('paidBy').isMongoId().withMessage('paidBy required'),
    body('splitType').isIn(['EQUAL','PERCENTAGE','CUSTOM']).withMessage('invalid splitType'),
    body('participants').isArray({ min: 1 }).withMessage('participants required'),
    body('participants.*.userId').isMongoId().withMessage('participant.userId must be a valid id'),
    body('participants.*.share').optional().isFloat({ min: 0 })
  ],
  expenseController.addExpense
);

// update expense
router.put(
  '/:id',
  authMiddleware,
  [
    param('id').isMongoId(),
    body('title').optional().isString(),
    body('amount').optional().isFloat({ gt: 0 }),
    body('paidBy').optional().isMongoId(),
    body('splitType').optional().isIn(['EQUAL','PERCENTAGE','CUSTOM']),
    body('participants').optional().isArray({ min: 1 }),
    body('participants.*.userId').optional().isMongoId(),
    body('participants.*.share').optional().isFloat({ min: 0 })
  ],
  expenseController.modifyExpense
);

// delete expense
router.delete('/:id', authMiddleware, [param('id').isMongoId()], expenseController.deleteExpense);

// list group expenses
router.get('/', authMiddleware, [query('groupId').isMongoId().withMessage('groupId query required')], expenseController.listExpenses);

// get single expense
router.get('/:id', authMiddleware, [param('id').isMongoId()], expenseController.getExpense);

module.exports = router;