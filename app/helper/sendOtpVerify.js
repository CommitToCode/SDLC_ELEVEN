const nodemailer = require("nodemailer");
const Otp = require("../models/otpModel");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

// Send Email Verification OTP
const sendEmailVerificationOTP = async (user) => {
  const otp = Math.floor(1000 + Math.random() * 9000).toString();

  // Save OTP
  await Otp.create({ userId: user._id, otp });

  await transporter.sendMail({
    from: `"DriveWell Rentals" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: "Verify Your DriveWell Account",
    html: `<h3>Hello ${user.name}</h3>
           <p>Your OTP is: <b>${otp}</b>. It expires in 15 minutes.</p>`,
  });

  return otp;
};

// Send Password Reset OTP
const sendPasswordResetOTP = async (user) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  await Otp.create({ userId: user._id, otp });

  await transporter.sendMail({
    from: `"DriveWell Rentals" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: "Password Reset OTP",
    html: `<h3>Hello ${user.name}</h3>
           <p>Your OTP for password reset is: <b>${otp}</b>. It expires in 15 minutes.</p>`,
  });

  return otp;
};

module.exports = { sendEmailVerificationOTP, sendPasswordResetOTP };
