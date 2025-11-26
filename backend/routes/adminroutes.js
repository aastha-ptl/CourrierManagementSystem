const express = require('express');
const router = express.Router();
const { getDashboard, getUnassignedUsers, reassignUserToBranch, deactivateUser, reactivateUser } = require('../controller/AdminController');
const{verifyToken, isAdmin}=require('../middleware/authmiddleware');


// Dashboard route
router.get('/dashboard', verifyToken, getDashboard);

// Get unassigned users
router.get('/unassigned-users', verifyToken, isAdmin, getUnassignedUsers);

// Reassign user to branch
router.put('/reassign-user', verifyToken, isAdmin, reassignUserToBranch);

// Deactivate user
router.put('/deactivate-user/:userId', verifyToken, isAdmin, deactivateUser);

// Reactivate user
router.put('/reactivate-user/:userId', verifyToken, isAdmin, reactivateUser);

module.exports = router;