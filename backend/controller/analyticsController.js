const Courier = require("../DB/CourierSchema");

// Get courier status breakdown
const getCourierStatusBreakdown = async (req, res) => {
  try {
    const user = req.user;
    const { branch } = req.query;

    // Build filter based on user role and branch selection
    let filter = {};
    
    // If branch admin, only show their branch's couriers
    if (user.role === "branchadmin" && user.branch) {
      filter.originBranch = user.branch;
    } 
    // If super admin and branch is selected
    else if (branch && branch !== "All") {
      filter.originBranch = branch;
    }
    // Super admin with "All" or no selection sees all couriers (no filter needed)

    // Get counts for each status
    const [delivered, inTransit, booked, unableToDeliver, outForDelivery, receivedAtDestination, total] = await Promise.all([
      Courier.countDocuments({ ...filter, status: "Delivered" }),
      Courier.countDocuments({ ...filter, status: "In Transit" }),
      Courier.countDocuments({ ...filter, status: "Booked" }),
      Courier.countDocuments({ ...filter, status: "Unable to Deliver" }),
      Courier.countDocuments({ ...filter, status: "Out for Delivery" }),
      Courier.countDocuments({ ...filter, status: "Received at Destination Branch" }),
      Courier.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      delivered,
      inTransit,
      booked,
      unableToDeliver,
      outForDelivery,
      receivedAtDestination,
      total,
    });
  } catch (error) {
    console.error("Error fetching courier status breakdown:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch courier status breakdown",
      error: error.message,
    });
  }
};

// Get transaction analytics (total transactions and branch-wise breakdown)
const getTransactionAnalytics = async (req, res) => {
  try {
    const user = req.user;
    const { branch } = req.query;

    // Build filter based on user role and branch selection
    let filter = {};
    
    // If branch admin, only show their branch's transactions
    if (user.role === "branchadmin" && user.branch) {
      filter.originBranch = user.branch;
    } 
    // If super admin and branch is selected
    else if (branch && branch !== "All") {
      filter.originBranch = branch;
    }

    // Get total transaction count and sum
    const transactions = await Courier.find(filter).select('price originBranch');
    const totalTransactions = transactions.length;
    const totalAmount = transactions.reduce((sum, courier) => {
      const price = Number(courier.price) || 0;
      return sum + price;
    }, 0);

    console.log('Total Transactions:', totalTransactions);
    console.log('Total Amount:', totalAmount);

    // Get branch-wise breakdown (only for super admin viewing all)
    let branchBreakdown = [];
    if (user.role === "admin" && (!branch || branch === "All")) {
      const branches = await Courier.aggregate([
        {
          $group: {
            _id: "$originBranch",
            count: { $sum: 1 },
            totalAmount: { $sum: { $ifNull: ["$price", 0] } }
          }
        },
        {
          $lookup: {
            from: "branches",
            localField: "_id",
            foreignField: "_id",
            as: "branchInfo"
          }
        },
        {
          $unwind: {
            path: "$branchInfo",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $project: {
            branchName: { $ifNull: ["$branchInfo.branchName", "Unknown"] },
            count: 1,
            totalAmount: { $round: ["$totalAmount", 2] }
          }
        },
        {
          $sort: { totalAmount: -1 }
        }
      ]);
      
      console.log('Branch Breakdown:', branches);
      branchBreakdown = branches;
    }

    res.status(200).json({
      success: true,
      totalTransactions,
      totalAmount: Number(totalAmount.toFixed(2)),
      branchBreakdown,
    });
  } catch (error) {
    console.error("Error fetching transaction analytics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch transaction analytics",
      error: error.message,
    });
  }
};

// Get courier status breakdown for a specific branch
const getBranchCourierStatusBreakdown = async (req, res) => {
  try {
    const { branchId } = req.params;
    
    console.log("=== Branch Courier Stats Request ===");
    console.log("Branch ID:", branchId);
    console.log("User:", req.user);

    // Get counts for each status for this specific branch
    const [delivered, inTransit, booked, unableToDeliver, outForDelivery, receivedAtDestination, total] = await Promise.all([
      Courier.countDocuments({ originBranch: branchId, status: "Delivered" }),
      Courier.countDocuments({ originBranch: branchId, status: "In Transit" }),
      Courier.countDocuments({ originBranch: branchId, status: "Booked" }),
      Courier.countDocuments({ originBranch: branchId, status: "Unable to Deliver" }),
      Courier.countDocuments({ originBranch: branchId, status: "Out for Delivery" }),
      Courier.countDocuments({ originBranch: branchId, status: "Received at Destination Branch" }),
      Courier.countDocuments({ originBranch: branchId }),
    ]);
    
    console.log("Results:", { delivered, inTransit, booked, unableToDeliver, outForDelivery, receivedAtDestination, total });

    res.status(200).json({
      success: true,
      delivered,
      inTransit,
      booked,
      unableToDeliver,
      outForDelivery,
      receivedAtDestination,
      total,
    });
  } catch (error) {
    console.error("Error fetching branch courier status breakdown:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch branch courier status breakdown",
      error: error.message,
    });
  }
};

module.exports = {
  getCourierStatusBreakdown,
  getTransactionAnalytics,
  getBranchCourierStatusBreakdown,
};
