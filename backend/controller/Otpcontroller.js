const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const User = require("../DB/Userschema");
const Otp = require("../DB/Otp");

dotenv.config();

// OTP Generator
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Nodemailer transporter (Gmail App Password must be used)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.APP_PASSWORD,
  },
});

// Reusable email sender function
const sendOtpEmail = async ({ email, subject, otp, type }) => {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5;">
      <h2>Hello,</h2>
      <p>You requested ${type === "register" ? "to register" : "a password reset"} on Courier Management System.</p>
      <p>Your OTP is:</p>
      <h3 style="color: #000;">${otp}</h3>
      <p>This OTP is valid for <strong>5 minutes</strong>.</p>
      <p>If this wasn't you, please ignore this email.</p>
      <hr />
      <p style="font-size: 12px; color: #777;">Courier System | Do not reply to this automated message.</p>
    </div>
  `;

  const plainText = `Hello,\n\nYour OTP is ${otp}. It is valid for 5 minutes.\n\nIf you did not request this, please ignore this email.\n\n– Courier Management System`;

  await transporter.sendMail({
    from: `Courier System <${process.env.EMAIL}>`,
    to: email,
    subject,
    text: plainText,
    html: htmlContent,
  });
};

// ===== 1. Send OTP for Registration =====
const sendRegisterOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(409).json({ error: "Email already registered" });

    const otp = generateOTP();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await Otp.deleteMany({ email });
    await Otp.create({ email, otp: hashedOtp, expiresAt, verified: false });

    await sendOtpEmail({
      email,
      subject: "Courier System - Your Registration OTP",
      otp,
      type: "register",
    });

    res.status(200).json({ success: true, message: "OTP sent for registration" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send registration OTP" });
  }
};

// ===== 2. Send OTP for Forgot Password =====
const sendForgotPasswordOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  try {
    const userExists = await User.findOne({ email });
    if (!userExists) return res.status(404).json({ error: "Email not registered" });

    const otp = generateOTP();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await Otp.deleteMany({ email });
    await Otp.create({ email, otp: hashedOtp, expiresAt, verified: false });

    await sendOtpEmail({
      email,
      subject: "Courier System - Reset Password OTP",
      otp,
      type: "forgot",
    });

    res.status(200).json({ success: true, message: "OTP sent for password reset" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send OTP" });
  }
};

// ===== 3. Verify OTP =====
const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ message: "Email and OTP required" });

  try {
    const record = await Otp.findOne({ email });

    if (!record) return res.status(400).json({ message: "OTP not found" });

    if (record.verified) return res.status(400).json({ message: "OTP already verified" });

    if (record.expiresAt < Date.now()) {
      await Otp.deleteMany({ email });
      return res.status(400).json({ message: "OTP expired" });
    }

    const isMatch = await bcrypt.compare(otp, record.otp);
    if (!isMatch) return res.status(400).json({ message: "Invalid OTP" });

    record.verified = true;
    await record.save();

    return res.status(200).json({ success: true, message: "OTP verified successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "OTP verification failed" });
  }
};

module.exports = {
  sendRegisterOtp,
  sendForgotPasswordOtp,
  verifyOtp,
};
