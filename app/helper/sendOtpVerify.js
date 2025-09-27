const nodemailer = require("nodemailer");
const Otp = require("../models/otpModel");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // 587 = false, 465 = true
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

exports.sendEmailVerificationOTP = async (user) => {
  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await Otp.create({
      userId: user._id,
      otp,
      purpose: "emailVerification",
    });

    const mailOptions = {
      from: `"Car Rental App" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Verify Your Email Address",
      text: `Hello ${user.name},\n\nYour verification OTP is: ${otp}\n\nThis OTP will expire in 10 minutes.`,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Verification email sent to:", user.email);

    return otp; // for testing
  } catch (error) {
    console.error("❌ Error sending verification email:", error);
    throw error;
  }
};

exports.sendPasswordResetOTP = async (user) => {
  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await Otp.create({
      userId: user._id,
      otp,
      purpose: "passwordReset",
    });

    const mailOptions = {
      from: `"Car Rental App" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Password Reset OTP",
      text: `Your password reset OTP is: ${otp}\n\nThis OTP will expire in 10 minutes.`,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Password reset email sent to:", user.email);

    return otp;
  } catch (error) {
    console.error("❌ Error sending reset OTP:", error);
    throw error;
  }
};
