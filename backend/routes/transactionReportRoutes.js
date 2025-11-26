const express = require("express");
const router = express.Router();
const { verifyToken, isAdmin } = require("../middleware/authmiddleware");
const {
  generateTransactionReport,
  exportTransactionReport,
} = require("../controller/transactionReportController");

// Generate transaction report
router.get("/generate-transaction", verifyToken, isAdmin, generateTransactionReport);

// Export transaction report (PDF or Excel)
router.get("/export-transaction", verifyToken, isAdmin, exportTransactionReport);

module.exports = router;
