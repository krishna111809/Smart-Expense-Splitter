const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const authMiddleware = require('../utils/authMiddleware');

// Create group
router.post('/', authMiddleware, groupController.createGroup);

// Get groups for current user
router.get('/', authMiddleware, groupController.getMyGroups);

// Add member to group
router.post('/:groupId/members', authMiddleware, groupController.addMember);

// Get group details
router.get('/:groupId', authMiddleware, groupController.getGroup);

module.exports = router;
