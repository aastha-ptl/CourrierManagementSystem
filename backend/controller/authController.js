const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../DB/Userschema");
const dotenv = require("dotenv");
const Otp = require("../DB/Otp");
dotenv.config();

// Register API
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, branch } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "user",
      branch: role === "branchadmin" || role === "staff" ? branch : null,
    });

    await newUser.save();

    res.status(201).json({ message: "User registered successfully", user: newUser });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error });
  }
};
// Update Password API
const updatePassword = async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res.status(400).json({ error: "Email and new password required" });
  }

  try {
    const otpRecord = await Otp.findOne({ email, verified: true });

    if (!otpRecord) {
      return res.status(400).json({ error: "OTP not verified for this email" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const user = await User.findOneAndUpdate(
      { email },
      { password: hashedPassword }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Delete OTP after use
    await Otp.deleteMany({ email });

    res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("Update Password Error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};


// Login API
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({ message: "Your account has been deactivated. Please contact support." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        branch: user.branch,
        isActive: user.isActive
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error });
  }
};

// Add Branch Admin
const createBranchAdmin = async (req, res) => {
  try {
    const { name, email, password,phone, branchId } = req.body;

    const existingBranchAdmin = await User.findOne({
      role: "branchadmin",
      branch: branchId,
    });

    if (existingBranchAdmin) {
      return res.status(400).json({
        message: "A branch admin already exists for this branch.",
      });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newBranchAdmin = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      role: "branchadmin",
      branch: branchId,
    });

    await newBranchAdmin.save();

    res.status(201).json({
      message: "Branch admin created successfully",
      user: newBranchAdmin,
    });
  } catch (error) {
    console.error("Error creating branch admin:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get All Branch Admins
const getAllBranchAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: "branchadmin" })
      .populate("branch", "branchName")
      .select("name email phone branch isActive"); 

    res.status(200).json(admins);
  } catch (err) {
    console.error("Error fetching branch admins:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// Reassign Branch Admin
// In your allusers route controller
const getAllUsers = async (req, res) => {
  try {
    // Exclude users with role "admin"
    const query = {
      role: { $ne: "admin" }, 
    };

    if (req.query.role && req.query.role !== "All") {
      query.role = req.query.role;
    }

    if (req.query.branch && req.query.branch !== "All") {
      query.branch = req.query.branch;
    }

    const users = await User.find(query).populate("branch");
    res.status(200).json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all staff and branch admins
const getStaffAndBranchAdmins = async (req, res) => {
  try {
    // Only staff and branchadmin
    const query = {
      role: { $in: ["staff", "branchadmin"] } 
    };

    if (req.query.branch && req.query.branch !== "All") {
      query.branch = req.query.branch;
    }

    const users = await User.find(query).populate("branch");
    res.status(200).json(users);
  } catch (err) {
    console.error("Error fetching staff and branch admins:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
//add staff by branch admin
const addStaffByBranchAdmin = async (req, res) => {
  try {
    const { name, email, phone, password, confirmPassword } = req.body;

    const { role, branch } = req.user;

    if (role !== "branchadmin") {
      return res.status(403).json({ message: "Only branch admins can add staff." });
    }

    if (!name || !email || !phone || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const staffUser = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      role: "staff",
      branch,
    });

    await staffUser.save();

    res.status(201).json({ message: "Staff added successfully", user: staffUser });
  } catch (error) {
    console.error("Add staff error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
// Get staff by branch
const getStaffByBranch = async (req, res) => {
  try {
    const { role, branch } = req.user;

    if (role !== "branchadmin") {
      return res.status(403).json({ message: "Access denied." });
    }

    const staffList = await User.find({ role: "staff", branch }).select("-password");

    res.status(200).json(staffList);
  } catch (error) {
    console.error("Error fetching staff:", error);
    res.status(500).json({ message: "Server error" });
  }
};
// Controller: Get all users (name + email)
const getAllUserNames = async (req, res) => {
  try {
    const users = await User.find(
      { role: "user" }, 
      { name: 1, email: 1, _id: 0 }
    );
    res.status(200).json(users);
  } catch (error) {
    console.error("Error in getAllUserNames:", error);
    res.status(500).json({ message: "Server error" });
  }
};

//change user active status 
const toggleUserActiveStatus = async (req, res) => {
  try {
    const { id } = req.params; // user id from URL
    const { isActive } = req.body; // new status from request body

    const user = await User.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: `User ${isActive ? 'activated' : 'deactivated'} successfully`, user });
  } catch (error) {
    res.status(500).json({ message: "Failed to update user status", error });
  }
};

// Update profile (authenticated)
const updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { name, email, currentPassword, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // If email is changing, ensure it's not taken by someone else
    if (email && email !== user.email) {
      const exists = await User.findOne({ email });
      if (exists && exists._id.toString() !== userId.toString()) {
        return res.status(409).json({ message: 'Email already in use' });
      }
      user.email = email;
    }

    if (name) user.name = name;

    // Handle password change
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password required to set a new password' });
      }
      const match = await bcrypt.compare(currentPassword, user.password);
      if (!match) return res.status(400).json({ message: 'Current password is incorrect' });

      const hashed = await bcrypt.hash(newPassword, 12);
      user.password = hashed;
    }

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        branch: user.branch,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get authenticated user's profile
const getProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    // Populate branch reference so frontend can show branch details
    const user = await User.findById(userId).select('-password').populate('branch');
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Convert to plain object so we can attach extra fields
    const userObj = user.toObject();

    // If the user belongs to a branch, find the branch admin for that branch
    if (userObj.branch && userObj.branch._id) {
      const branchAdmin = await User.findOne({ role: 'branchadmin', branch: userObj.branch._id }).select('name email');
      // attach branchAdmin info (may be null if not assigned)
      userObj.branchAdmin = branchAdmin;
    }

    res.json(userObj);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};



// Export all handlers
module.exports = {
  registerUser,
  loginUser,
  createBranchAdmin,
  getAllBranchAdmins,
  getAllUsers,
  getStaffAndBranchAdmins,
  addStaffByBranchAdmin,
  getStaffByBranch,
  updatePassword,
  updateProfile,
  getProfile,
  getAllUserNames,
  toggleUserActiveStatus
};
