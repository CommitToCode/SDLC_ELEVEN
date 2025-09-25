const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const otpModel = require("../../models/otpModel");
const Joi = require("joi");
const sendEmailVerificationOTP = require("../../helper/sendOtpVerify");
const sendPasswordResetOTP = require("../../helper/sendPasswordResetOtp");

// ===================== Joi Validation =====================
const signupSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/)
    .required(),
  licenseNumber: Joi.string().required(),
  licenseFile: Joi.string().optional(),
  isLicenseVerified: Joi.boolean().optional(),
});

// ===================== SIGNUP =====================
exports.signup = async (req, res) => {
  try {
    const { error } = signupSchema.validate(req.body);
    if (error) return res.status(400).json({ status: false, message: error.details[0].message });

    const { name, email, password, licenseNumber, isLicenseVerified } = req.body;

    let existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ status: false, message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const user = new User({
      name,
      email,
      password: hashedPassword,
      licenseNumber,
      licenseFile: req.file ? req.file.filename : null,
      isLicenseVerified,
      verificationToken,
    });

    await user.save();
    await sendEmailVerificationOTP(req, user);

    res.status(201).json({
      status: true,
      message: "Signup successful! Check your email to verify your account.",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        licenseNumber: user.licenseNumber,
        licenseFile: user.licenseFile,
        isVerified: user.isVerified,
      },
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
    if (!user) return res.status(404).json({ status: false, message: "Email not found" });
    if (user.isVerified) return res.status(400).json({ status: false, message: "Email already verified" });

    const emailVerification = await otpModel.findOne({ userId: user._id, otp });
    if (!emailVerification) return res.status(400).json({ status: false, message: "Invalid OTP" });

    const expired = new Date() > new Date(emailVerification.createdAt.getTime() + 15 * 60 * 1000);
    if (expired) return res.status(400).json({ status: false, message: "OTP expired" });

    user.isVerified = true;
    await user.save();
    await otpModel.deleteMany({ userId: user._id });

    res.status(200).json({ status: true, message: "Email verified successfully" });
  } catch (err) {
    console.error("Verify Email Error:", err);
    res.status(500).json({ status: false, message: "Server error" });
  }
};

// ===================== LOGIN =====================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ status: false, message: "All fields required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ status: false, message: "User not found" });
    if (!user.isVerified) return res.status(401).json({ status: false, message: "Account not verified" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ status: false, message: "Invalid password" });

    const token = jwt.sign({ _id: user._id, email: user.email }, process.env.JWT_SECRET_KEY, { expiresIn: "2h" });

    res.status(200).json({ status: true, message: "Login successful", user: { id: user._id, name: user.name, email: user.email }, token });
  } catch (err) {
    console.error("Login Error:", err);
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

    await sendPasswordResetOTP(req, user);
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
    if (!email || !otp || !newPassword) return res.status(400).json({ status: false, message: "All fields required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ status: false, message: "User not found" });

    const otpRecord = await otpModel.findOne({ userId: user._id, otp });
    if (!otpRecord) return res.status(400).json({ status: false, message: "Invalid OTP" });

    const expired = new Date() > new Date(otpRecord.createdAt.getTime() + 15 * 60 * 1000);
    if (expired) return res.status(400).json({ status: false, message: "OTP expired" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    await otpModel.deleteMany({ userId: user._id });

    res.status(200).json({ status: true, message: "Password reset successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: "Server error" });
  }
};
