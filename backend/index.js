const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./Connection");
const authRoutes = require("./routes/authroutes");
const branchRoutes = require("./routes/branchroutes");
const nodemailer = require("nodemailer");
const otproutes = require("./routes/otproutes");
const courierRoutes = require("./routes/courierroutes");
const adminRoutes = require("./routes/adminroutes");
const reportRoutes = require("./routes/reportroutes");
const transactionReportRoutes = require("./routes/transactionReportRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const path = require("path");

// Load environment variables
dotenv.config();

// Initialize Express App
const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/branches", branchRoutes);
app.use("/api/otp", otproutes);
app.use("/api/couriers", courierRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/reports", transactionReportRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/receipts", express.static(path.join(__dirname, "receipts")));
// Default Route
app.get("/", (req, res) => {
  res.send("API is running...");
});



// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
