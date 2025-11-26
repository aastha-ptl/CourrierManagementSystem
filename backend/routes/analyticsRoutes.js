const express = require("express");
const { getCourierStatusBreakdown, getTransactionAnalytics, getBranchCourierStatusBreakdown } = require("../controller/analyticsController");
const { verifyToken } = require("../middleware/authmiddleware");

const router = express.Router();

// Get courier status breakdown (works for both admin and branch admin)
router.get("/courier-status", verifyToken, getCourierStatusBreakdown);

// Get transaction analytics (works for both admin and branch admin)
router.get("/transaction-analytics", verifyToken, getTransactionAnalytics);

// Get courier status breakdown for a specific branch
router.get("/branch-courier-status/:branchId", verifyToken, getBranchCourierStatusBreakdown);

module.exports = router;
