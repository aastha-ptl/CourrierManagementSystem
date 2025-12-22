// utils/emailService.js
const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

if (!process.env.EMAIL || !process.env.APP_PASSWORD) {
  // Fail fast to surface misconfiguration early
  throw new Error("Email service configuration missing: set EMAIL and APP_PASSWORD in environment.");
}

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.APP_PASSWORD,
  },
});

const sendEmailWithAttachment = async ({ to, subject, text, html, attachmentPath }) => {
  if (!to || !subject || (!text && !html)) {
    throw new Error("sendEmailWithAttachment: 'to', 'subject' and one of 'text' or 'html' are required.");
  }

  const mailOptions = {
    from: `"DakiyaPro" <${process.env.EMAIL}>`,
    to,
    subject,
    text,
    html,
  };

  // Only add attachments if attachmentPath is provided and exists
  if (attachmentPath) {
    const exists = fs.existsSync(attachmentPath);
    if (exists) {
      mailOptions.attachments = [
        {
          filename: path.basename(attachmentPath),
          path: attachmentPath,
        },
      ];
    } else {
      // Log and continue without attachment to avoid failing the whole send
      console.warn(`Email attachment not found: ${attachmentPath}`);
    }
  }

  try {
    const info = await transporter.sendMail(mailOptions);
    return info; // allow callers to inspect messageId, etc.
  } catch (err) {
    console.error("Failed to send email:", err);
    throw err;
  }
};

module.exports = sendEmailWithAttachment;
