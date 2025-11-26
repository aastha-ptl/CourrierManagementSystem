// In controller/AdminController.js
const User = require('../DB/Userschema');
const Branch = require('../DB/Branchschema');
const Courier = require('../DB/CourierSchema');

const getDashboard = async (req, res) => {
  try {
    // Count users by role
    const admins = await User.countDocuments({ role: 'admin' });
    const branchAdmins = await User.countDocuments({ role: 'branchadmin' });
    const staff = await User.countDocuments({ role: 'staff' });
    const customers = await User.countDocuments({ role: 'user' });
    const totalStaff = admins + branchAdmins + staff;

    // Count couriers by status
    const pending = await Courier.countDocuments({ status: 'Booked' });
    const inTransit = await Courier.countDocuments({ status: 'In Transit' });
    const delivered = await Courier.countDocuments({ status: 'Delivered' });

    // Count branches
    const branches = await Branch.countDocuments();

    res.json({
      admins,
      branchAdmins,
      staff,
      customers,
      couriers: { pending, inTransit, delivered },
      branches,
      totalStaff
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard data', error });
  }
};
// Get all unassigned users (users without a branch or deactivated users)
const getUnassignedUsers = async (req, res) => {
  try {
    const unassignedUsers = await User.find({ 
      $or: [
        { branch: { $exists: false } },
        { branch: null },
        { isActive: false }
      ],
      role: { $in: ['branchadmin', 'staff'] }
    }).select('name email role isActive');
    
    res.json(unassignedUsers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching unassigned users', error });
  }
};

// Reassign user to a branch
const reassignUserToBranch = async (req, res) => {
  try {
    const { userId, branchId } = req.body;

    if (!userId || !branchId) {
      return res.status(400).json({ message: 'User ID and Branch ID are required' });
    }

    // Check if branch exists
    const branch = await Branch.findById(branchId);
    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If reassigning a branch admin, check if branch already has one
    if (user.role === 'branchadmin') {
      const existingAdmin = await User.findOne({ 
        branch: branchId, 
        role: 'branchadmin',
        _id: { $ne: userId } // exclude current user
      });
      
      if (existingAdmin) {
        return res.status(400).json({ 
          message: `Branch "${branch.branchName}" already has a branch admin (${existingAdmin.name})` 
        });
      }
    }

    // Update user's branch
    user.branch = branchId;
    // Reactivate user when reassigning
    user.isActive = true;
    await user.save();

    res.json({ 
      message: `User ${user.name} successfully reassigned to ${branch.branchName}`,
      user 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error reassigning user', error });
  }
};

// Deactivate user account
const deactivateUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.isActive) {
      return res.status(400).json({ message: 'User is already deactivated' });
    }

    user.isActive = false;
    // Remove branch assignment when deactivating
    user.branch = null;
    await user.save();

    res.json({ 
      message: `User ${user.name} has been deactivated successfully`,
      user 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error deactivating user', error });
  }
};

// Reactivate user account
const reactivateUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isActive) {
      return res.status(400).json({ message: 'User is already active' });
    }

    user.isActive = true;
    await user.save();

    res.json({ 
      message: `User ${user.name} has been reactivated successfully`,
      user 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error reactivating user', error });
  }
};

module.exports = { getDashboard, getUnassignedUsers, reassignUserToBranch, deactivateUser, reactivateUser };