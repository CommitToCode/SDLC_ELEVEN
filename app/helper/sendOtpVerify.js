const nodemailer = require("nodemailer");
const Otp = require("../models/otpModel");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

exports.sendEmailVerificationOTP = async (user) => {
  try {
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    await Otp.create({ userId: user._id, otp });

    await transporter.sendMail({
      from: `"DriveWell Rentals" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Verify Your DriveWell Account",
      html: `<h3>Hello ${user.name}</h3><p>Your OTP: <b>${otp}</b> (expires in 15 min)</p>`
    });

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
      from: `"DriveWell Rentals" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Password Reset OTP",
      html: `<h3>Hello ${user.name}</h3><p>Your OTP for reset: <b>${otp}</b> (expires in 15 min)</p>`
    });

    return otp;
  } catch (err) {
    console.error("Password OTP error:", err);
    return null;
  }
};
