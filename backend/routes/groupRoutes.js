// backend/routes/groupRoutes.js
const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const groupController = require('../controllers/groupController');
const authMiddleware = require('../utils/authMiddleware');

// Create group
router.post(
  '/',
  authMiddleware,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('description').optional().isString(),
    body('currency').optional().isString().isLength({ min: 3, max: 5 })
  ],
  groupController.createGroup
);

// Update group
router.put(
  '/:groupId',
  authMiddleware,
  [
    param('groupId').isMongoId().withMessage('Invalid groupId'),
    body('name').optional().trim().notEmpty(),
    body('description').optional().isString(),
    body('currency').optional().isString()
  ],
  groupController.updateGroup
);

// Delete group
router.delete(
  '/:groupId',
  authMiddleware,
  [param('groupId').isMongoId().withMessage('Invalid groupId')],
  groupController.deleteGroup
);

// Add member to group
router.post(
  '/:groupId/members',
  authMiddleware,
  [
    param('groupId').isMongoId(),
    body('memberUserId').isMongoId().withMessage('memberUserId required'),
    body('displayName').optional().isString(),
    body('role').optional().isIn(['owner','admin','member'])
  ],
  groupController.addMember
);

// Update member in group
router.put(
  '/:groupId/members',
  authMiddleware,
  [
    param('groupId').isMongoId(),
    body('memberUserId').isMongoId().withMessage('memberUserId required'),
    body('displayName').optional().isString(),
    body('role').optional().isIn(['owner','admin','member'])
  ],
  groupController.updateMember
);

// Remove member from group by memberId param
router.delete(
  '/:groupId/members/:memberId',
  authMiddleware,
  [
    param('groupId').isMongoId(),
    param('memberId').isMongoId()
  ],
  groupController.removeMember
);

// Remove member from group by memberUserId in body
router.delete(
  '/:groupId/members',
  authMiddleware,
  [
    param('groupId').isMongoId(),
    body('memberUserId').isMongoId().withMessage('memberUserId required')
  ],
  groupController.removeMember
);

// Get groups for current user
router.get('/', authMiddleware, groupController.getMyGroups);

// Get group details
router.get('/:groupId', authMiddleware, [param('groupId').isMongoId()], groupController.getGroup);

module.exports = router;