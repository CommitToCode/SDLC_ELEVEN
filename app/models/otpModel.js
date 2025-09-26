const mongoose = require("mongoose");

// Defining Schema
const otpverifySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 600},
});

// Model
const otpModel = mongoose.model("otp", otpverifySchema);

module.exports = otpModel;
