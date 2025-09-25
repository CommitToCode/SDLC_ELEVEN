const transporter = require("../config/EmailConfig");
const otpVerifyModel = require("../models/otpModel");

const sendEmailVerificationOTP = async (req, user) => {
  // Generate a random 4-digit OTP
  const otp = Math.floor(1000 + Math.random() * 9000);

  // Save OTP in Database
  const userData = await new otpVerifyModel({
    userId: user._id,
    otp: otp,
  }).save();
  console.log("OTP Stored:", userData);

  // Car & Bike Rental themed email
  await transporter.sendMail({
    from: `"DriveWell Rentals" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: "🚘 Verify Your DriveWell Account - OTP Inside!",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #007bff;">Hello ${user.name}! 👋</h2>
        <p>Welcome to <strong>DriveWell Rentals</strong> – your trusted partner for <em>cars & bikes on the go</em>.</p>
        
        <p>Before you hit the road, we just need to verify your email. Please use the following one-time password (OTP):</p>
        
        <div style="text-align: center; margin: 20px 0;">
          <h1 style="background: #007bff; color: white; display: inline-block; padding: 10px 20px; border-radius: 8px; letter-spacing: 3px;">
            ${otp}
          </h1>
        </div>
        
        <p>This OTP is valid for <strong>15 minutes</strong>. Please don’t share it with anyone.</p>
        
        <p>If you didn’t create an account with <strong>DriveWell Rentals</strong>, you can safely ignore this email.</p>
        
        <hr style="margin: 20px 0;">
        <p style="font-size: 14px; color: #777;">Drive safe, ride easy 🚗🏍️<br/>- The DriveWell Team</p>
      </div>
    `,
  });

  return otp;
};

module.exports = sendEmailVerificationOTP;
