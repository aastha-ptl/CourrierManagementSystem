const Branch = require("../DB/Branchschema");
const User = require("../DB/Userschema"); 
const Courier = require("../DB/CourierSchema");
// Add New Branch
const addBranch = async (req, res) => {
  try {
    const { branchName, city, address, state, pincode } = req.body;

    if (!branchName || !city || !address || !state || !pincode) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (!/^\d{6}$/.test(pincode)) {
      return res.status(400).json({ message: "Pincode must be a 6-digit number." });
    }

    const stateValue = typeof state === "object" && state.value ? state.value : state;

    const newBranch = new Branch({
      branchName,
      city,
      address,
      state: stateValue,
      pincode,
    });

    await newBranch.save();

    res.status(201).json({ message: "Branch added successfully", branch: newBranch });
  } catch (err) {
    console.error("Error in addBranch:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get All Branches (only branch names)
const getAllBranches = async (req, res) => {
  try {
    const branches = await Branch.find({}, "branchName");
    res.status(200).json(branches);
  } catch (error) {
    console.error("Error in getAllBranches:", error);
    res.status(500).json({ message: "Server error" });
  }
};
// Get All Branches with Admin

const getBranchesWithAdmins = async (req, res) => {
  try {
    // Fetch all branches
    const branches = await Branch.find();

    // For each branch, find admin, staff count, and courier count
    const results = await Promise.all(
      branches.map(async (branch) => {
        // Find Branch Admin
        const admin = await User.findOne({
          branch: branch._id,
          role: "branchadmin",
        }).select("name email");

        // Count Staff in this branch
        const staffCount = await User.countDocuments({
          branch: branch._id,
          role: "staff",
        });

        // Count Couriers SENT FROM this branch (origin branch)
        const courierCount = await Courier.countDocuments({
          originBranch: branch._id,
        });

        return {
          ...branch._doc,          // spread branch fields
          branchAdmin: admin || null,
          staffCount,
          courierCount,
        };
      })
    );

    res.status(200).json(results);
  } catch (error) {
    console.error("Error in getBranchesWithAdmins:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// Update Branch Details
const updateBranch = async (req, res) => {
  try {
    const { branchId } = req.params;
    const { branchName, address } = req.body;

    const updatedBranch = await Branch.findByIdAndUpdate(
      branchId,
      { branchName, address },
      { new: true }
    );

    if (!updatedBranch) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    res.json(updatedBranch);
  } catch (error) {
    res.status(500).json({ message: 'Error updating branch', error });
  }
};

// Delete Branch
const deleteBranch = async (req, res) => {
  try {
    const { branchId } = req.params;
    const { force } = req.query;

    // Check if branch has any associated users (branch admins or staff)
    const usersCount = await User.countDocuments({ branch: branchId });
    
    // Check if branch has any associated couriers
    const couriersCount = await Courier.countDocuments({ 
      $or: [{ originBranch: branchId }, { destinationBranch: branchId }] 
    });

    // If force delete is requested, unassign users from this branch
    if (force === 'true') {
      if (usersCount > 0) {
        // Unassign all users from this branch (set branch to null)
        // This keeps the user accounts but removes their branch assignment
        await User.updateMany(
          { branch: branchId },
          { $unset: { branch: "" } }
        );
      }
      // Note: We keep couriers in the system as historical records
    } else {
      // If not force delete, check for associations
      if (usersCount > 0) {
        return res.status(400).json({ 
          message: 'Cannot delete branch. It has associated users (branch admins or staff). Please reassign or remove them first.' 
        });
      }

      if (couriersCount > 0) {
        return res.status(400).json({ 
          message: 'Cannot delete branch. It has associated couriers. Please reassign or remove them first.' 
        });
      }
    }

    const deletedBranch = await Branch.findByIdAndDelete(branchId);

    if (!deletedBranch) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    res.json({ 
      message: 'Branch deleted successfully', 
      branch: deletedBranch,
      usersUnassigned: force === 'true' ? usersCount : 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting branch', error });
  }
};

// Export
module.exports = {
  addBranch,
  getAllBranches,
  getBranchesWithAdmins,
  updateBranch,
  deleteBranch
};
