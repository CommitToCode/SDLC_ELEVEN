require("dotenv").config();
const nodemailer = require("nodemailer");
const Otp = require("../models/otpModel");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false, // important for Gmail
  },
});

exports.sendEmailVerificationOTP = async (user) => {
  try {
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    await Otp.create({ userId: user._id, otp });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: user.email, 
      subject: "Verify Your DriveWell Account",
      html: `<h3>Hello ${user.name}</h3><p>Your OTP: <b>${otp}</b> (expires in 15 min)</p>`,
    });

    console.log("Email OTP sent to:", user.email, otp);
    return otp;
  } catch (err) {
    console.error("Email OTP error:", err);
    return null;
  }
};

exports.sendPasswordResetOTP = async (user) => {
  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await Otp.create({ userId: user._id, otp });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: "Password Reset OTP",
      html: `<h3>Hello ${user.name}</h3><p>Your OTP for reset: <b>${otp}</b> (expires in 15 min)</p>`,
    });

    console.log("Password reset OTP sent to:", user.email, otp);
    return otp;
  } catch (err) {
    console.error("Password OTP error:", err);
    return null;
  }
};
