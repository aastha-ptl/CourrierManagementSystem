const express = require("express");
const router = express.Router();
const {
  sendRegisterOtp,
  sendForgotPasswordOtp,
  verifyOtp,
} = require("../controller/Otpcontroller");

// Registration OTP
router.post("/send-register-otp", sendRegisterOtp);

// Forgot Password OTP
router.post("/send-forgot-password-otp", sendForgotPasswordOtp);

// Verify OTP
router.post("/verify-otp", verifyOtp);

module.exports = router;
