const nodemailer = require("nodemailer");
const Otp = require("../models/Otp");
const crypto = require("crypto");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: { rejectUnauthorized: false },
});

transporter.verify((err, success) => {
  if (err) console.error("SMTP Error:", err);
  else console.log("SMTP Ready ✅");
});

const generateOTP = () => crypto.randomInt(100000, 999999).toString();

async function sendEmailVerificationOTP(user) {
  try {
    const otp = generateOTP();

    await Otp.create({
      userId: user._id,
      otp,
      purpose: "emailVerification",
    });

    await transporter.sendMail({
      from: `"Car Rental App" <${process.env.EMAIL_FROM}>`,
      to: user.email,
      subject: "Verify Your Email",
      html: `
        <h2>Hello ${user.name}</h2>
        <p>Thank you for signing up! Use the OTP below to verify your email:</p>
        <h3 style="color:blue;">${otp}</h3>
        <p>This OTP expires in 10 minutes.</p>
      `,
    });

    console.log("✅ Verification OTP sent to:", user.email);
  } catch (err) {
    console.error("❌ Error sending verification email:", err);
    throw err;
  }
}

async function sendPasswordResetOTP(user) {
  try {
    const otp = generateOTP();

    await Otp.create({
      userId: user._id,
      otp,
      purpose: "passwordReset",
    });

    await transporter.sendMail({
      from: `"Car Rental App" <${process.env.EMAIL_FROM}>`,
      to: user.email,
      subject: "Password Reset OTP",
      html: `
        <h2>Hello ${user.name}</h2>
        <p>Use the OTP below to reset your password:</p>
        <h3 style="color:red;">${otp}</h3>
        <p>This OTP expires in 10 minutes.</p>
      `,
    });

    console.log("✅ Password reset OTP sent to:", user.email);
  } catch (err) {
    console.error("❌ Error sending password reset email:", err);
    throw err;
  }
}

module.exports = { sendEmailVerificationOTP, sendPasswordResetOTP };
