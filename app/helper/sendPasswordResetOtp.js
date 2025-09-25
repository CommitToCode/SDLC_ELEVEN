const nodemailer = require("nodemailer");
const otpModel = require("../models/otpModel");
const crypto = require("crypto");

const sendPasswordResetOTP = async (req, user) => {
  try {
    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    // Save OTP in DB
    await otpModel.create({
      userId: user._id,
      otp,
    });

    // Configure transporter
    const transporter = nodemailer.createTransport({
      service: "Gmail", // or use SMTP if needed
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email content (HTML template)
    const mailOptions = {
      from: `"Fitness App" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Password Reset OTP - Fitness App",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background: #f9f9f9;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>Hello <b>${user.name}</b>,</p>
          <p>You requested to reset your password. Use the OTP below to reset it:</p>
          <h1 style="color: #e63946; letter-spacing: 2px;">${otp}</h1>
          <p>This OTP is valid for <b>15 minutes</b>.</p>
          <p>If you didn’t request this, please ignore this email.</p>
          <br/>
          <p>Stay healthy 💪,</p>
          <p><b>Fitness App Team</b></p>
        </div>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    console.log("Password Reset OTP sent:", otp);
  } catch (error) {
    console.error("Error sending password reset OTP:", error);
  }
};

module.exports = sendPasswordResetOTP;
