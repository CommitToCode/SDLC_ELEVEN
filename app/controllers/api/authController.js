const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmailVerificationOTP = require("../../helper/sendOtpVerify");
const otpModel = require("../../models/otpModel");
const Joi = require("joi");
const sendPasswordResetOTP = require("../../helper/sendPasswordResetOtp");

// Joi Schema
const signupSchema = Joi.object({
  name: Joi.string().min(3).max(100).required().messages({
    "string.empty": "Name is required",
    "string.min": "Name must be at least 3 characters",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Please enter a valid email",
    "string.empty": "Email is required",
  }),
  password: Joi.string()
    .pattern(
      new RegExp(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$"
      )
    )
    .required()
    .messages({
      "string.pattern.base":
        "Password must be at least 8 characters and include 1 uppercase, 1 lowercase, 1 number, and 1 special character",
      "string.empty": "Password is required",
    }),

  licenseNumber: Joi.string().required(),

  licenseNumber: Joi.string().optional(),
  licenseFile: Joi.string().optional(),
  isLicenseVerified: Joi.boolean().optional(),
});

// ===================== SIGNUP =====================

// exports.signup = async (req, res) => {
//   try {
//     const { error } = signupSchema.validate(req.body);
//     if (error) {
//       return res
//         .status(400)
//         .json({ status: false, message: error.details[0].message });
//     }

//     const {
//       name,
//       email,
//       password,
//       licenseNumber,
//       licenseFile,
//       isLicenseVerified,
//     } = req.body;

//     let existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res
//         .status(400)
//         .json({ status: false, message: "Email already registered" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const verificationToken = crypto.randomBytes(32).toString("hex");

//     const user = new User({
//       name,
//       email,
//       password: hashedPassword,
//       licenseNumber,
//       licenseFile,
//       isLicenseVerified,
//       verificationToken,
//     });

//     const data = await user.save();

//     await sendEmailVerificationOTP(req, user);

//     res.status(201).json({
//       status: true,
//       message:
//         "Signup successful! Please check your email to verify your account.",
//       data: {
//         id: data._id,
//         name: data.name,
//         email: data.email,
//         license: data.licenseNumber,
//         isVerified: data.isVerified,
//       },
//     });
//   } catch (error) {
//     console.error("Signup Error:", error);
//     res.status(500).json({ status: false, message: "Server error" });
//   }
// };





exports.signup = async (req, res) => {
  try {
    const { error } = signupSchema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .json({ status: false, message: error.details[0].message });
    }

    const {
      name,
      email,
      password,
      licenseNumber,
      licenseFile,

      isLicenseVerified,
    } = req.body;

    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ status: false, message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const user = new User({
      name,
      email,
      password: hashedPassword,
      licenseNumber,

      licenseFile: req.file ? req.file.path : null, 

      licenseFile,

      isLicenseVerified,
      verificationToken,
    });

    const data = await user.save();

    await sendEmailVerificationOTP(req, user);

    res.status(201).json({
      status: true,
      message:
        "Signup successful! Please check your email to verify your account.",
      data: {
        id: data._id,
        name: data.name,
        email: data.email,
        license: data.licenseNumber,

        licenseFile: data.licenseFile,

        isVerified: data.isVerified,
      },
    });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ status: false, message: "Server error" });
  }
};











// ===================== VERIFY EMAIL =====================
exports.verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res
        .status(400)
        .json({ status: false, message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ status: false, message: "Email does not exist" });
    }

    if (user.isVerified) {
      return res
        .status(400)
        .json({ status: false, message: "Email is already verified" });
    }

    const emailVerification = await otpModel.findOne({ userId: user._id, otp });
    if (!emailVerification) {
      await sendEmailVerificationOTP(req, user);
      return res.status(400).json({
        status: false,
        message: "Invalid OTP, new OTP sent to your email",
      });
    }

    const currentTime = new Date();
    const expirationTime = new Date(
      emailVerification.createdAt.getTime() + 15 * 60 * 1000
    );
    if (currentTime > expirationTime) {
      await sendEmailVerificationOTP(req, user);
      return res.status(400).json({
        status: false,
        message: "OTP expired, new OTP sent to your email",
      });
    }

    user.isVerified = true;
    await user.save();
    await otpModel.deleteMany({ userId: user._id });

    res
      .status(200)
      .json({ status: true, message: "Email verified successfully" });
  } catch (error) {
    console.error("Verify Email Error:", error);
    res.status(500).json({
      status: false,
      message: "Unable to verify email, please try again later",
    });
  }
};

// ===================== LOGIN =====================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        status: false,
        message: "All fields are required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    if (!user.isVerified) {
      return res
        .status(401)
        .json({ status: false, message: "Your account is not verified" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid password" });
    }

    const token = jwt.sign(
      { _id: user._id, name: user.name, email: user.email },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "2h" }
    );

    res.status(200).json({
      status: true,
      message: "User login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ status: false, message: "Server error" });
  }
};

// ===================== FORGOT PASSWORD =====================
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res
        .status(400)
        .json({ status: false, message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    await sendPasswordResetOTP(req, user);

    res.status(200).json({
      status: true,
      message: "Password reset OTP sent to your email",
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ status: false, message: "Server error" });
  }
};

// ===================== RESET PASSWORD =====================
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res
        .status(400)
        .json({ status: false, message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    const otpRecord = await otpModel.findOne({ userId: user._id, otp });
    if (!otpRecord) {
      return res.status(400).json({ status: false, message: "Invalid OTP" });
    }

    const currentTime = new Date();
    const expirationTime = new Date(
      otpRecord.createdAt.getTime() + 15 * 60 * 1000
    );
    if (currentTime > expirationTime) {
      await sendPasswordResetOTP(req, user);
      return res.status(400).json({
        status: false,
        message: "OTP expired, a new OTP has been sent to your email",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    await otpModel.deleteMany({ userId: user._id });

    res.status(200).json({
      status: true,
      message: "Password reset successful, you can now login",
    });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ status: false, message: "Server error" });
  }
};
