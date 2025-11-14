const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');

// Create group
router.post('/', groupController.createGroup);

// Get groups for current user
router.get('/', groupController.getMyGroups);

// Add member to group
router.post('/:groupId/members', groupController.addMember);

// Get group details
router.get('/:groupId', groupController.getGroup);

module.exports = router;
