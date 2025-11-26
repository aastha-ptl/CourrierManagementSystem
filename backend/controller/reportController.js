const Courier = require("../DB/CourierSchema");
const generateReportPDF = require("../utils/generateReportPDF");
const generateReportExcel = require("../utils/generateReportExcel");

// Generate report based on filters
const generateReport = async (req, res) => {
  try {
    const { startDate, endDate, status, originBranch, destinationBranch } = req.query;

    // Build query filter
    const filter = {};

    // Date range filter
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate + "T23:59:59.999Z"), // Include the entire end date
      };
    }

    // Status filter
    if (status && status !== "All") {
      filter.status = status;
    }

    // Origin branch filter
    if (originBranch && originBranch !== "All") {
      filter.originBranch = originBranch;
    }

    // Destination branch filter
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
        originBranch,
        destinationBranch,
      },
    });
  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate report",
      error: error.message,
    });
  }
};

// Export report as PDF or Excel
const exportReport = async (req, res) => {
  try {
    const { startDate, endDate, status, originBranch, destinationBranch, format } = req.query;

    // Build query filter (same as generateReport)
    const filter = {};

    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate + "T23:59:59.999Z"),
      };
    }

    if (status && status !== "All") {
      filter.status = status;
    }

    if (originBranch && originBranch !== "All") {
      filter.originBranch = originBranch;
    }

    if (destinationBranch && destinationBranch !== "All") {
      filter.destinationBranch = destinationBranch;
    }

    // Fetch couriers
    const couriers = await Courier.find(filter)
      .populate("originBranch", "branchName city")
      .populate("destinationBranch", "branchName city")
      .sort({ createdAt: -1 });

    // Get branch name if specific branch is selected
    let branchName = "All";
    if (originBranch && originBranch !== "All" && couriers.length > 0) {
      branchName = couriers[0]?.originBranch?.branchName || originBranch;
    }

    // Create filters object for export functions
    const filters = {
      startDate,
      endDate,
      status,
      branch: originBranch,
      branchName,
      originBranch,
      destinationBranch,
    };

    if (format === "pdf") {
      // Generate PDF using utility function
      generateReportPDF(couriers, filters, res);
    } else if (format === "excel") {
      // Generate Excel using utility function
      await generateReportExcel(couriers, filters, res);
    } else {
      res.status(400).json({ message: "Invalid format. Use 'pdf' or 'excel'" });
    }
  } catch (error) {
    console.error("Error exporting report:", error);
    res.status(500).json({
      success: false,
      message: "Failed to export report",
      error: error.message,
    });
  }
};

module.exports = {
  generateReport,
  exportReport,
};
