const express = require("express");
const { generateReport, exportReport } = require("../controller/reportController");
const { generateBranchAdminReport, exportBranchAdminReport, generateBranchAdminTransactionReport, exportBranchAdminTransactionReport } = require("../controller/branchAdminReportController");
const { verifyToken, isAdmin } = require("../middleware/authmiddleware");

const router = express.Router();

// Generate report (with filters) - Super Admin only
router.get("/generate", verifyToken, isAdmin, generateReport);

// Export report (PDF or Excel) - Super Admin only
router.get("/export", verifyToken, isAdmin, exportReport);

// Generate report for Branch Admin (only their branch's couriers)
router.get("/generate-branch-admin", verifyToken, generateBranchAdminReport);

// Export report for Branch Admin (PDF or Excel)
router.get("/export-branch-admin", verifyToken, exportBranchAdminReport);

// Generate transaction report for Branch Admin (only their branch's transactions)
router.get("/generate-branch-admin-transaction", verifyToken, generateBranchAdminTransactionReport);

// Export transaction report for Branch Admin (PDF or Excel)
router.get("/export-branch-admin-transaction", verifyToken, exportBranchAdminTransactionReport);

module.exports = router;
