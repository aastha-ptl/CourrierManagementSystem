const Courier = require("../DB/CourierSchema");
const generateTransactionPDF = require("../utils/generateTransactionPDF");
const generateTransactionExcel = require("../utils/generateTransactionExcel");

// Generate transaction report based on filters
const generateTransactionReport = async (req, res) => {
  try {
    const { startDate, endDate, branch } = req.query;

    // Build query filter - include all statuses (transaction is taken at booking)
    const filter = {};

    // Date range filter (based on booking date)
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate + "T23:59:59.999Z"),
      };
    }

    // Branch filter (only origin branch - where courier was booked)
    if (branch && branch !== "All") {
      filter.originBranch = branch;
    }

    // Fetch all couriers (transactions)
    const transactions = await Courier.find(filter)
      .populate("originBranch", "branchName city")
      .populate("destinationBranch", "branchName city")
      .sort({ createdAt: -1 });

    // Calculate total amount
    const totalAmount = transactions.reduce((sum, courier) => sum + (courier.price || 0), 0);

    // Format transactions for response
    const formattedTransactions = transactions.map((courier) => ({
      trackingId: courier.trackingId,
      customerName: courier.sender?.name || courier.receiver?.name || "N/A",
      originBranch: courier.originBranch?.branchName || "N/A",
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
        branch,
      },
    });
  } catch (error) {
    console.error("Error generating transaction report:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate transaction report",
      error: error.message,
    });
  }
};

// Export transaction report as PDF or Excel
const exportTransactionReport = async (req, res) => {
  try {
    const { startDate, endDate, branch, format } = req.query;

    // Build query filter - include all statuses (transaction is taken at booking)
    const filter = {};

    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate + "T23:59:59.999Z"),
      };
    }

    if (branch && branch !== "All") {
      filter.originBranch = branch;
    }

    // Fetch transactions
    const transactions = await Courier.find(filter)
      .populate("originBranch", "branchName city")
      .populate("destinationBranch", "branchName city")
      .sort({ createdAt: -1 });

    // Calculate total amount
    const totalAmount = transactions.reduce((sum, courier) => sum + (courier.price || 0), 0);

    // Format transactions
    const formattedTransactions = transactions.map((courier) => ({
      trackingId: courier.trackingId,
      customerName: courier.sender?.name || courier.receiver?.name || "N/A",
      originBranch: courier.originBranch?.branchName || "N/A",
      destinationBranch: courier.destinationBranch?.branchName || "N/A",
      status: courier.status || "N/A",
      amount: courier.price || 0,
      weight: courier.weight || 0,
      distance: courier.distanceInKm || 0,
      deliveryDate: courier.status === "Delivered" && courier.deliveryDate ? courier.deliveryDate : null,
    }));

    // Get branch name if specific branch is selected
    let branchName = "All";
    if (branch && branch !== "All" && transactions.length > 0) {
      branchName = transactions[0]?.originBranch?.branchName || branch;
    }

    // Create filters object for export functions
    const filters = {
      startDate,
      endDate,
      branch,
      branchName,
      totalAmount,
      count: transactions.length,
    };

    if (format === "pdf") {
      // Generate PDF using utility function
      generateTransactionPDF(formattedTransactions, filters, res);
    } else if (format === "excel") {
      // Generate Excel using utility function
      await generateTransactionExcel(formattedTransactions, filters, res);
    } else {
      res.status(400).json({ message: "Invalid format. Use 'pdf' or 'excel'" });
    }
  } catch (error) {
    console.error("Error exporting transaction report:", error);
    res.status(500).json({
      success: false,
      message: "Failed to export transaction report",
      error: error.message,
    });
  }
};

module.exports = {
  generateTransactionReport,
  exportTransactionReport,
};
