// helper/emailSetup.js
const nodemailer = require("nodemailer");
const Otp = require("../models/otpModel");
const crypto = require("crypto");

// =============== EMAIL TRANSPORTER SETUP ===============
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,   // e.g., "smtp.gmail.com"
  port: process.env.EMAIL_PORT,   // e.g., 587
  secure: false,                  // true for 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// =============== OTP GENERATOR ===============
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString(); // 6-digit OTP
};

// =============== SEND EMAIL VERIFICATION OTP ===============
exports.sendEmailVerificationOTP = async (user) => {
  try {
    const otp = generateOTP();

    // save OTP in DB
    await Otp.create({
      userId: user._id,
      otp,
      purpose: "emailVerification",
      createdAt: new Date(),
    });

    const mailOptions = {
      from: `"Auth System" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Verify Your Email",
      html: `
        <h2>Hello ${user.name},</h2>
        <p>Thank you for signing up! Please verify your email using the OTP below:</p>
        <h3 style="color:blue;">${otp}</h3>
        <p>This OTP will expire in <b>10 minutes</b>.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Email verification OTP sent to:", user.email);
  } catch (err) {
    console.error("Error sending email verification OTP:", err);
  }
};

// =============== SEND PASSWORD RESET OTP ===============
exports.sendPasswordResetOTP = async (user) => {
  try {
    const otp = generateOTP();

    // save OTP in DB
    await Otp.create({
      userId: user._id,
      otp,
      purpose: "passwordReset",
      createdAt: new Date(),
    });

    const mailOptions = {
      from: `"Auth System" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <h2>Hello ${user.name},</h2>
        <p>You requested to reset your password. Use the OTP below to proceed:</p>
        <h3 style="color:red;">${otp}</h3>
        <p>This OTP will expire in <b>10 minutes</b>. If you did not request a password reset, please ignore this email.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Password reset OTP sent to:", user.email);
  } catch (err) {
    console.error("Error sending password reset OTP:", err);
  }
};
