const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const User = require("../models/User");
const Profile = require("../models/Profile");
const Otp = require("../models/Otp");
const generateToken = require("../utils/generateToken");
const { sendOtpEmail } = require("../utils/mailer");

const OTP_MINUTES = 10;
const MAX_OTP_ATTEMPTS = 5;

const calculateAge = (dateOfBirth) => {
  const birthDate = new Date(`${dateOfBirth}T00:00:00`);
  if (Number.isNaN(birthDate.getTime())) return -1;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const month = today.getMonth() - birthDate.getMonth();
  if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
};

const normalizeEmail = (email) => email.trim().toLowerCase();
const createOtp = () => String(crypto.randomInt(100000, 1000000));
const hashOtp = (otp) => bcrypt.hash(otp, 10);

const saveOtp = async ({ email, purpose, otp, pendingRegistration }) => {
  await Otp.findOneAndUpdate(
    { email },
    {
      email,
      purpose,
      otpHash: await hashOtp(otp),
      expiresAt: new Date(Date.now() + OTP_MINUTES * 60 * 1000),
      attempts: 0,
      pendingRegistration: pendingRegistration || undefined,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
};

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  gender: user.gender,
  isVerified: user.isVerified,
  isPremium: user.isPremium,
  role: user.role,
});

const register = async (req, res) => {
  try {
    const { name, email, password, dateOfBirth, gender } = req.body || {};
    const normalizedEmail = email ? normalizeEmail(email) : "";

    if (!name?.trim() || !normalizedEmail || !password || !dateOfBirth || !gender) {
      return res.status(400).json({ message: "All registration fields are required." });
    }
    if (password.length < 8) return res.status(400).json({ message: "Password must be at least 8 characters." });
    if (calculateAge(dateOfBirth) < 18) return res.status(400).json({ message: "You must be at least 18 years old to create an account." });

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ message: "An account with this email already exists. Please log in." });
    }

    const otp = createOtp();
    const hashedPassword = await bcrypt.hash(password, 12);

    await saveOtp({
      email: normalizedEmail,
      purpose: "registration",
      otp,
      pendingRegistration: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        dateOfBirth,
        gender,
      },
    });

    try {
      await sendOtpEmail({ to: normalizedEmail, otp, purpose: "registration" });
    } catch (mailError) {
      await Otp.deleteOne({ email: normalizedEmail });
      console.error("REGISTRATION EMAIL ERROR:", mailError);
      return res.status(503).json({ message: "We could not send the verification email. Please check the mail settings and try again." });
    }

    return res.status(200).json({
      message: "Verification code sent to your email.",
      email: normalizedEmail,
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return res.status(500).json({ message: "Unable to start registration." });
  }
};

const verifyRegistration = async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email || "");
    const otp = String(req.body?.otp || "").trim();
    if (!email || !/^\d{6}$/.test(otp)) return res.status(400).json({ message: "Enter the 6-digit verification code." });

    const record = await Otp.findOne({ email, purpose: "registration" }).select("+otpHash");
    if (!record) return res.status(400).json({ message: "No active verification request found. Please register again." });
    if (record.expiresAt < new Date()) {
      await Otp.deleteOne({ _id: record._id });
      return res.status(400).json({ message: "This code has expired. Please register again." });
    }
    if (record.attempts >= MAX_OTP_ATTEMPTS) return res.status(429).json({ message: "Too many incorrect attempts. Please request a new code." });

    const valid = await bcrypt.compare(otp, record.otpHash);
    if (!valid) {
      await Otp.updateOne({ _id: record._id }, { $inc: { attempts: 1 } });
      return res.status(400).json({ message: "Incorrect verification code." });
    }

    const pending = record.pendingRegistration;
    if (!pending) return res.status(400).json({ message: "Registration session expired. Please register again." });

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      await Otp.deleteOne({ _id: record._id });
      return res.status(409).json({ message: "An account with this email already exists. Please log in." });
    }

    const profilePhoto = String(req.body?.profilePhoto || "").trim();
    const profilePhotoPublicId = String(req.body?.profilePhotoPublicId || "").trim();
    if (!profilePhoto || !profilePhotoPublicId) return res.status(400).json({ message: "Profile photo is required to finish registration." });

    const user = await User.create({
      name: pending.name,
      email: pending.email,
      password: pending.password,
      dateOfBirth: pending.dateOfBirth,
      gender: pending.gender,
      isVerified: true,
    });

    await Profile.create({
      user: user._id,
      profilePhoto,
      profilePhotoPublicId,
    });

    await Otp.deleteOne({ _id: record._id });

    return res.status(201).json({
      message: "Email verified and account created successfully.",
      token: generateToken(user._id),
      user: publicUser(user),
    });
  } catch (error) {
    console.error("VERIFY REGISTRATION ERROR:", error);
    if (error.code === 11000) return res.status(409).json({ message: "An account with this email already exists." });
    return res.status(500).json({ message: "Unable to complete registration." });
  }
};

const resendRegistrationOtp = async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email || "");
    const record = await Otp.findOne({ email, purpose: "registration" });
    if (!record?.pendingRegistration) return res.status(400).json({ message: "Registration session not found. Please register again." });

    const otp = createOtp();
    await saveOtp({ email, purpose: "registration", otp, pendingRegistration: record.pendingRegistration });
    await sendOtpEmail({ to: email, otp, purpose: "registration" });
    return res.json({ message: "A new verification code has been sent." });
  } catch (error) {
    console.error("RESEND REGISTRATION OTP ERROR:", error);
    return res.status(503).json({ message: "Unable to send a new verification code." });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const normalizedEmail = email ? normalizeEmail(email) : "";
    if (!normalizedEmail || !password) return res.status(400).json({ message: "Email and password are required." });

    const user = await User.findOne({ email: normalizedEmail }).select("+password");
    if (!user) return res.status(401).json({ message: "Invalid email or password." });
    if (!user.isActive) return res.status(403).json({ message: "Your account is inactive." });
    if (!user.isVerified) return res.status(403).json({ message: "Please verify your email before logging in." });

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) return res.status(401).json({ message: "Invalid email or password." });

    user.lastActiveAt = new Date();
    await user.save();
    return res.json({ message: "Login successful", token: generateToken(user._id), user: publicUser(user) });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({ message: "Unable to log in right now." });
  }
};

const requestPasswordReset = async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email || "");
    if (!email) return res.status(400).json({ message: "Email is required." });

    const user = await User.findOne({ email });
    if (!user || !user.isVerified) return res.status(404).json({ message: "No verified account was found with this email." });

    const otp = createOtp();
    await saveOtp({ email, purpose: "password_reset", otp });
    await sendOtpEmail({ to: email, otp, purpose: "password_reset" });

    return res.json({ message: "Password reset code sent to your email.", email });
  } catch (error) {
    console.error("PASSWORD RESET REQUEST ERROR:", error);
    return res.status(503).json({ message: "Unable to send the password reset code." });
  }
};

const resetPassword = async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email || "");
    const otp = String(req.body?.otp || "").trim();
    const newPassword = req.body?.newPassword || "";

    if (!email || !/^\d{6}$/.test(otp) || newPassword.length < 8) {
      return res.status(400).json({ message: "Enter a valid code and a password of at least 8 characters." });
    }

    const record = await Otp.findOne({ email, purpose: "password_reset" }).select("+otpHash");
    if (!record) return res.status(400).json({ message: "No active password reset request found." });
    if (record.expiresAt < new Date()) {
      await Otp.deleteOne({ _id: record._id });
      return res.status(400).json({ message: "This code has expired. Please request a new one." });
    }
    if (record.attempts >= MAX_OTP_ATTEMPTS) return res.status(429).json({ message: "Too many incorrect attempts. Please request a new code." });

    const valid = await bcrypt.compare(otp, record.otpHash);
    if (!valid) {
      await Otp.updateOne({ _id: record._id }, { $inc: { attempts: 1 } });
      return res.status(400).json({ message: "Incorrect reset code." });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(404).json({ message: "Account not found." });

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();
    await Otp.deleteOne({ _id: record._id });

    return res.json({ message: "Password reset successfully. You can now log in." });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);
    return res.status(500).json({ message: "Unable to reset your password." });
  }
};

module.exports = { register, verifyRegistration, resendRegistrationOtp, login, requestPasswordReset, resetPassword };
