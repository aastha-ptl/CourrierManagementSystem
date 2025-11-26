const Courier = require("../DB/CourierSchema");
const generateBranchAdminReportPDF = require("../utils/generateBranchAdminReportPDF");
const generateBranchAdminReportExcel = require("../utils/generateBranchAdminReportExcel");
const generateBranchAdminTransactionPDF = require("../utils/generateBranchAdminTransactionPDF");
const generateBranchAdminTransactionExcel = require("../utils/generateBranchAdminTransactionExcel");

// Generate report for branch admin (only their branch's couriers)
const generateBranchAdminReport = async (req, res) => {
  try {
    const { startDate, endDate, status, destinationBranch } = req.query;
    const branchAdminBranchId = req.user.branch; // Get branch ID from authenticated user

    if (!branchAdminBranchId) {
      return res.status(400).json({
        success: false,
        message: "Branch Admin must be associated with a branch",
      });
    }

    // Build query filter - only origin branch from this branch admin's branch
    const filter = {
      originBranch: branchAdminBranchId, // Only couriers from their branch
    };

    // Date range filter
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate + "T23:59:59.999Z"),
      };
    }

    // Status filter
    if (status && status !== "All") {
      filter.status = status;
    }

    // Destination branch filter (optional)
    if (destinationBranch && destinationBranch !== "All") {
      filter.destinationBranch = destinationBranch;
    }

    // Fetch couriers with populated branch details
    const couriers = await Courier.find(filter)
      .populate("originBranch", "branchName city")
      .populate("destinationBranch", "branchName city")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: couriers.length,
      couriers,
      filters: {
        startDate,
        endDate,
        status,
        destinationBranch,
      },
    });
  } catch (error) {
    console.error("Error generating branch admin report:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate report",
      error: error.message,
    });
  }
};

// Export report for branch admin as PDF or Excel
const exportBranchAdminReport = async (req, res) => {
  try {
    const { startDate, endDate, status, destinationBranch, format } = req.query;
    const branchAdminBranchId = req.user.branch; // Get branch ID from authenticated user

    if (!branchAdminBranchId) {
      return res.status(400).json({
        success: false,
        message: "Branch Admin must be associated with a branch",
      });
    }

    // Build query filter - only origin branch from this branch admin's branch
    const filter = {
      originBranch: branchAdminBranchId,
    };

    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate + "T23:59:59.999Z"),
      };
    }

    if (status && status !== "All") {
      filter.status = status;
    }

    if (destinationBranch && destinationBranch !== "All") {
      filter.destinationBranch = destinationBranch;
    }

    // Fetch couriers
    const couriers = await Courier.find(filter)
      .populate("originBranch", "branchName city")
      .populate("destinationBranch", "branchName city")
      .sort({ createdAt: -1 });

    // Get branch name
    let branchName = "All";
    if (couriers.length > 0) {
      branchName = couriers[0]?.originBranch?.branchName || "N/A";
    }

    // Create filters object for export functions
    const filters = {
      startDate,
      endDate,
      status,
      branch: branchAdminBranchId,
      branchName,
      originBranch: branchAdminBranchId,
      destinationBranch,
    };

    if (format === "pdf") {
      // Generate PDF using branch admin specific utility function
      generateBranchAdminReportPDF(couriers, filters, res);
    } else if (format === "excel") {
      // Generate Excel using branch admin specific utility function
      await generateBranchAdminReportExcel(couriers, filters, res);
    } else {
      res.status(400).json({ message: "Invalid format. Use 'pdf' or 'excel'" });
    }
  } catch (error) {
    console.error("Error exporting branch admin report:", error);
    res.status(500).json({
      success: false,
      message: "Failed to export report",
      error: error.message,
    });
  }
};

// Generate transaction report for branch admin (only their branch's transactions)
const generateBranchAdminTransactionReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const branchAdminBranchId = req.user.branch; // Get branch ID from authenticated user

    if (!branchAdminBranchId) {
      return res.status(400).json({
        success: false,
        message: "Branch Admin must be associated with a branch",
      });
    }

    // Build query filter - only transactions from this branch admin's branch
    const filter = {
      originBranch: branchAdminBranchId, // Only couriers from their branch
    };

    // Date range filter (based on booking date)
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate + "T23:59:59.999Z"),
      };
    }

    // Fetch all couriers (transactions)
    const transactions = await Courier.find(filter)
      .populate("originBranch", "branchName city")
      .populate("destinationBranch", "branchName city")
      .sort({ createdAt: -1 });

    // Calculate total amount
    const totalAmount = transactions.reduce((sum, courier) => sum + (courier.price || 0), 0);

    // Format transactions for response (without Origin Branch column)
    const formattedTransactions = transactions.map((courier) => ({
      trackingId: courier.trackingId,
      customerName: courier.sender?.name || courier.receiver?.name || "N/A",
      destinationBranch: courier.destinationBranch?.branchName || "N/A",
      status: courier.status || "N/A",
      amount: courier.price || 0,
      weight: courier.weight || 0,
      distance: courier.distanceInKm || 0,
      deliveryDate: courier.status === "Delivered" && courier.deliveryDate ? courier.deliveryDate : null,
    }));

    res.status(200).json({
      success: true,
      count: transactions.length,
      totalAmount,
      transactions: formattedTransactions,
      filters: {
        startDate,
        endDate,
      },
    });
  } catch (error) {
    console.error("Error generating branch admin transaction report:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate transaction report",
      error: error.message,
    });
  }
};

// Export transaction report for branch admin as PDF or Excel
const exportBranchAdminTransactionReport = async (req, res) => {
  try {
    const { startDate, endDate, format } = req.query;
    const branchAdminBranchId = req.user.branch; // Get branch ID from authenticated user

    if (!branchAdminBranchId) {
      return res.status(400).json({
        success: false,
        message: "Branch Admin must be associated with a branch",
      });
    }

    // Build query filter - only transactions from this branch admin's branch
    const filter = {
      originBranch: branchAdminBranchId,
    };

    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate + "T23:59:59.999Z"),
      };
    }

    // Fetch transactions
    const transactions = await Courier.find(filter)
      .populate("originBranch", "branchName city")
      .populate("destinationBranch", "branchName city")
      .sort({ createdAt: -1 });

    // Calculate total amount
    const totalAmount = transactions.reduce((sum, courier) => sum + (courier.price || 0), 0);

    // Format transactions (without Origin Branch column)
    const formattedTransactions = transactions.map((courier) => ({
      trackingId: courier.trackingId,
      customerName: courier.sender?.name || courier.receiver?.name || "N/A",
      destinationBranch: courier.destinationBranch?.branchName || "N/A",
      status: courier.status || "N/A",
      amount: courier.price || 0,
      weight: courier.weight || 0,
      distance: courier.distanceInKm || 0,
      deliveryDate: courier.status === "Delivered" && courier.deliveryDate ? courier.deliveryDate : null,
    }));

    // Get branch name
    let branchName = "Branch";
    if (transactions.length > 0) {
      branchName = transactions[0]?.originBranch?.branchName || "Branch";
    }

    // Create filters object for export functions
    const filters = {
      startDate,
      endDate,
      branch: branchAdminBranchId,
      branchName,
      totalAmount,
      count: transactions.length,
      isBranchAdmin: true, // Flag to indicate this is branch admin report
    };

    if (format === "pdf") {
      // Generate PDF using branch admin specific utility function
      generateBranchAdminTransactionPDF(formattedTransactions, filters, res);
    } else if (format === "excel") {
      // Generate Excel using branch admin specific utility function
      await generateBranchAdminTransactionExcel(formattedTransactions, filters, res);
    } else {
      res.status(400).json({ message: "Invalid format. Use 'pdf' or 'excel'" });
    }
  } catch (error) {
    console.error("Error exporting branch admin transaction report:", error);
    res.status(500).json({
      success: false,
      message: "Failed to export transaction report",
      error: error.message,
    });
  }
};

module.exports = {
  generateBranchAdminReport,
  exportBranchAdminReport,
  generateBranchAdminTransactionReport,
  exportBranchAdminTransactionReport,
};
