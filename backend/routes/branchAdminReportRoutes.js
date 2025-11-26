const express = require("express");
const router = express.Router();
const {
  generateBranchAdminReport,
  exportBranchAdminReport,
} = require("../controller/branchAdminReportController");
const { protect } = require("../middleware/authmiddleware");

// Generate branch admin report
router.get("/generate-branch-admin", protect, generateBranchAdminReport);

// Export branch admin report (PDF/Excel)
router.get("/export-branch-admin", protect, exportBranchAdminReport);

module.exports = router;
