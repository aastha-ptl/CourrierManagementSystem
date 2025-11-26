// utils/emailService.js
const nodemailer = require("nodemailer");
const path = require("path");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.APP_PASSWORD,
  },
});

const sendEmailWithAttachment = async ({ to, subject, text, attachmentPath }) => {
  const mailOptions = {
    from: `"DakiyaPro" <${process.env.EMAIL}>`,
    to,
    subject,
    text,
  };

  // Only add attachments if attachmentPath is provided
  if (attachmentPath) {
    mailOptions.attachments = [
      {
        filename: path.basename(attachmentPath),
        path: attachmentPath,
      },
    ];
  }

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmailWithAttachment;
