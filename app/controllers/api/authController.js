const User = require("../models/User");
const Otp = require("../models/otpModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const Joi = require("joi");
const { sendEmailVerificationOTP, sendPasswordResetOTP } = require("../helper/sendOtp");

// Validation Schema
const signupSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/)
    .required(),
  licenseNumber: Joi.string().required(),
  isLicenseVerified: Joi.boolean().optional(),
});

// ===================== SIGNUP =====================
exports.signup = async (req, res) => {
  try {
    const { error } = signupSchema.validate(req.body);
    if (error)
      return res.status(400).json({ status: false, message: error.details[0].message });

    const { name, email, password, licenseNumber, isLicenseVerified } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ status: false, message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const licenseFile = req.file ? req.file.filename : null;

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      licenseNumber,
      licenseFile,
      isLicenseVerified,
      verificationToken,
    });

    await sendEmailVerificationOTP(user);

    res.status(201).json({
      status: true,
      message: "Signup successful! OTP sent to your email.",
      data: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ status: false, message: "Server error" });
  }
};

// ===================== VERIFY EMAIL =====================
exports.verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ status: false, message: "All fields required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ status: false, message: "User not found" });
    if (user.isVerified) return res.status(400).json({ status: false, message: "Already verified" });

    const record = await Otp.findOne({ userId: user._id, otp });
    if (!record) return res.status(400).json({ status: false, message: "Invalid OTP" });

    const expired = new Date() > new Date(record.createdAt.getTime() + 15 * 60 * 1000);
    if (expired) return res.status(400).json({ status: false, message: "OTP expired" });

    user.isVerified = true;
    await user.save();
    await Otp.deleteMany({ userId: user._id });

    res.status(200).json({ status: true, message: "Email verified successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: "Server error" });
  }
};

// ===================== LOGIN =====================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ status: false, message: "All fields required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ status: false, message: "User not found" });
    if (!user.isVerified)
      return res.status(401).json({ status: false, message: "Account not verified" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ status: false, message: "Invalid password" });

    const token = jwt.sign({ _id: user._id, email: user.email }, process.env.JWT_SECRET_KEY, { expiresIn: "2h" });

    res.status(200).json({ status: true, message: "Login successful", user: { id: user._id, name: user.name, email: user.email }, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: "Server error" });
  }
};

// ===================== FORGOT PASSWORD =====================
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ status: false, message: "Email required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ status: false, message: "User not found" });

    await sendPasswordResetOTP(user);
    res.status(200).json({ status: true, message: "Password reset OTP sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: "Server error" });
  }
};

// ===================== RESET PASSWORD =====================
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword)
      return res.status(400).json({ status: false, message: "All fields required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ status: false, message: "User not found" });

    const record = await Otp.findOne({ userId: user._id, otp });
    if (!record) return res.status(400).json({ status: false, message: "Invalid OTP" });

    const expired = new Date() > new Date(record.createdAt.getTime() + 15 * 60 * 1000);
    if (expired) return res.status(400).json({ status: false, message: "OTP expired" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    await Otp.deleteMany({ userId: user._id });

    res.status(200).json({ status: true, message: "Password reset successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: "Server error" });
  }
};
