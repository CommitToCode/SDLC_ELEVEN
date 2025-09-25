const User = require("../../models/User");
const Otp = require("../../models/otpModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendEmailVerificationOTP, sendPasswordResetOTP } = require("../../helper/sendOtpVerify");

// ===================== SIGNUP =====================
exports.signup = async (req, res) => {
  try {
    const { name, email, password, licenseNumber } = req.body;
    const licenseFile = req.file ? req.file.filename : null;

    if (!name || !email || !password || !licenseNumber)
      return res.status(400).json({ status: false, message: "All fields required" });

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ status: false, message: "Email exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword, licenseNumber, licenseFile });

    await sendEmailVerificationOTP(user);

    res.status(201).json({ status: true, message: "Signup success. Check email OTP." });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ status: false, message: "Server error" });
  }
};

// ===================== VERIFY EMAIL =====================
exports.verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ status: false, message: "User not found" });

    const otpRecord = await Otp.findOne({ userId: user._id, otp });
    if (!otpRecord) return res.status(400).json({ status: false, message: "Invalid OTP" });

    user.isVerified = true;
    await user.save();
    await Otp.deleteMany({ userId: user._id });

    res.json({ status: true, message: "Email verified successfully" });
  } catch (err) {
    console.error("Verify error:", err);
    res.status(500).json({ status: false, message: "Server error" });
  }
};

// ===================== LOGIN =====================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ status: false, message: "User not found" });
    if (!user.isVerified) return res.status(401).json({ status: false, message: "Email not verified" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ status: false, message: "Invalid password" });

    const token = jwt.sign({ _id: user._id, email: user.email }, process.env.JWT_SECRET_KEY, { expiresIn: "2h" });
    res.json({ status: true, message: "Login success", token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ status: false, message: "Server error" });
  }
};

// ===================== FORGOT PASSWORD =====================
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ status: false, message: "User not found" });

    await sendPasswordResetOTP(user);
    res.json({ status: true, message: "Password reset OTP sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: "Server error" });
  }
};

// ===================== RESET PASSWORD =====================
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ status: false, message: "User not found" });

    const otpRecord = await Otp.findOne({ userId: user._id, otp });
    if (!otpRecord) return res.status(400).json({ status: false, message: "Invalid OTP" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    await Otp.deleteMany({ userId: user._id });

    res.json({ status: true, message: "Password reset successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: "Server error" });
  }
};
