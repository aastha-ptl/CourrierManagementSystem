const express = require("express");
const {
  registerUser,
  loginUser,
  createBranchAdmin,
  getAllBranchAdmins,
  getAllUsers,
  getStaffAndBranchAdmins,
  addStaffByBranchAdmin,
  getStaffByBranch,
  updatePassword,
  getAllUserNames,
  toggleUserActiveStatus,
  updateProfile,
  getProfile

} = require("../controller/authController");
const { verifyToken, isAdmin } = require("../middleware/authmiddleware");

const router = express.Router();

// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Add branch admin
router.post("/createbranchadmin", verifyToken, isAdmin, createBranchAdmin);

// Get all branch admins
router.get("/getbranchadmins", verifyToken, isAdmin, getAllBranchAdmins);

// Get all users (for admin)
router.get("/allusers", verifyToken, isAdmin, getAllUsers);

// Get all staff and branch admins
// routes/authRoutes.js
router.get("/staffandbranchadmins", verifyToken, isAdmin, getStaffAndBranchAdmins);
//  Branch admin adds staff
router.post("/addstaff", verifyToken, addStaffByBranchAdmin);
//get staff by branch
router.get("/staff-by-branch", verifyToken, getStaffByBranch);
// Update password
router.post("/update-password", updatePassword);
// Get all user names (only name field)
router.get("/all-user-names", verifyToken, getAllUserNames);
// Toggle user active status
router.patch("/:id/status", verifyToken,toggleUserActiveStatus);
// Get current user's profile
router.get('/profile', verifyToken, getProfile);
//update user profile
router.put('/update-profile', verifyToken,updateProfile);

module.exports = router;
