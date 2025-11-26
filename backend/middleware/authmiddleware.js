const jwt = require("jsonwebtoken");
const User = require("../DB/Userschema");

const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Access Denied. No token provided." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch fresh user to get latest branch
    const user = await User.findById(decoded.id);

    req.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      branch: user.branch,
    };

    next();
  } catch (err) {
    res.status(400).json({ message: "Invalid token." });
  }
};


const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  next();
};

module.exports = {
  verifyToken,
  isAdmin,
};
