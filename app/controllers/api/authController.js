const User = require("../../models/User");
const Otp = require("../../models/otpModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendEmailVerificationOTP, sendPasswordResetOTP } = require("../../helper/sendOtpVerify");

// ===================== SIGNUP =====================
exports.signup = async (req, res) => {
  try {
    // 🔹 Extract data from body (works for both form-data & JSON)
    const { name, email, password, licenseNumber } = req.body;

    // 🔹 Validate required fields
    if (!name?.trim() || !email?.trim() || !password?.trim() || !licenseNumber?.trim()) {
      return res.status(400).json({
        status: false,
        message: "All fields (name, email, password, licenseNumber) are required",
      });
    }

    // 🔹 Check existing user
    const isUserExist = await User.findOne({ email });
    if (isUserExist) {
      return res.status(400).json({
        status: false,
        message: "Email already exists. Try logging in.",
      });
    }

    // 🔹 Hash password securely
    const hashedPassword = await bcrypt.hash(password, 10);

    // 🔹 Handle optional license file
    const licenseFile = req.file ? req.file.filename : null;

    // 🔹 Create user in database
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      licenseNumber,
      licenseFile,
    });

    await newUser.save();

    // 🔹 Send email verification OTP
    await sendEmailVerificationOTP(newUser);

    // 🔹 Remove password before sending response
    const { password: _, ...userData } = newUser.toObject();

    // 🔹 Success response
    return res.status(201).json({
      status: true,
      message: "Signup successful! Please check your email for OTP verification.",
      user: userData,
    });
  } catch (error) {
    console.error("❌ Signup Controller Error:", error.message);
    return res.status(500).json({
      status: false,
      message: "Internal server error during signup.",
      error: error.message,
    });
  }
};

// ===================== VERIFY EMAIL =====================
exports.verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    const otpRecord = await Otp.findOne({
      userId: user._id,
      otp,
      purpose: "emailVerification",
    });

    if (!otpRecord) {
      return res.status(400).json({ status: false, message: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    await user.save();
    await Otp.deleteMany({ userId: user._id, purpose: "emailVerification" });

    res.json({ status: true, message: "Email verified successfully" });
  } catch (err) {
    console.error("Verify email error:", err);
    res.status(500).json({ status: false, message: "Server error" });
  }
};

// ===================== LOGIN =====================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }
    if (!user.isVerified) {
      return res.status(401).json({ status: false, message: "Email not verified" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ status: false, message: "Invalid password" });
    }

    const token = jwt.sign(
      { _id: user._id, email: user.email },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "2h" }
    );

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

    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    await sendPasswordResetOTP(user);
    res.json({ status: true, message: "Password reset OTP sent to your email" });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ status: false, message: "Server error" });
  }
};

// ===================== RESET PASSWORD =====================
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    const otpRecord = await Otp.findOne({
      userId: user._id,
      otp,
      purpose: "passwordReset",
    });

    if (!otpRecord) {
      return res.status(400).json({ status: false, message: "Invalid or expired OTP" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    await Otp.deleteMany({ userId: user._id, purpose: "passwordReset" });

    res.json({ status: true, message: "Password reset successful" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ status: false, message: "Server error" });
  }
};
