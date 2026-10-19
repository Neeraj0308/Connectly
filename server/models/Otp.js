const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    purpose: {
      type: String,
      enum: ["registration", "password_reset"],
      required: true,
    },
    otpHash: { type: String, required: true, select: false },
    expiresAt: { type: Date, required: true },
    attempts: { type: Number, default: 0 },
    pendingRegistration: {
      name: String,
      email: String,
      password: String,
      dateOfBirth: Date,
      gender: String,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Otp", otpSchema);
