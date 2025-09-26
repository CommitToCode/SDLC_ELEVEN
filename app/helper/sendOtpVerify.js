const nodemailer = require("nodemailer");
const Otp = require("../models/otpModel");
const crypto = require("crypto");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_PORT == 465, // true if SSL (465), false if TLS (587)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: { rejectUnauthorized: false },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP connection error:", error);
  } else {
    console.log("✅ SMTP server ready");
  }
});

const generateOTP = () => crypto.randomInt(100000, 999999).toString();

// =============== SEND EMAIL VERIFICATION OTP ===============
exports.sendEmailVerificationOTP = async (user) => {
  try {
    const otp = generateOTP();

    await Otp.create({
      userId: user._id,
      otp,
      purpose: "emailVerification",
      createdAt: new Date(),
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: user.email,
      subject: "Verify Your Email",
      html: `
        <h2>Hello ${user.name},</h2>
        <p>Please verify your email using this OTP:</p>
        <h3 style="color:blue;">${otp}</h3>
        <p>This OTP will expire in <b>10 minutes</b>.</p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Verification OTP sent:", info.messageId);
  } catch (err) {
    console.error("❌ Error sending email verification OTP:", err);
  }
};

// =============== SEND PASSWORD RESET OTP ===============
exports.sendPasswordResetOTP = async (user) => {
  try {
    const otp = generateOTP();

    await Otp.create({
      userId: user._id,
      otp,
      purpose: "passwordReset",
      createdAt: new Date(),
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <h2>Hello ${user.name},</h2>
        <p>You requested a password reset. Use this OTP:</p>
        <h3 style="color:red;">${otp}</h3>
        <p>This OTP will expire in <b>10 minutes</b>.</p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Password reset OTP sent:", info.messageId);
  } catch (err) {
    console.error("❌ Error sending password reset OTP:", err);
  }
};
