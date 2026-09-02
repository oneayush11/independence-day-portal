const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const validator = require("validator");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const { validateTrustedEmail } = require("../utils/emailValidation");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });

// @route POST /api/auth/register
const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email, password required" });
    }
    const emailCheck = validateTrustedEmail(email);
    if (!emailCheck.valid) {
      return res.status(400).json({ success: false, message: emailCheck.message });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    const user = await User.create({ name, email, password, phone });

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/auth/login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/auth/me
const getMe = async (req, res) => {
  res.json({ success: true, data: req.user });
};

const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000)); // 6 digits
const hashOtp = (otp) => crypto.createHash("sha256").update(otp).digest("hex");

// @route POST /api/auth/forgot-password
// Step 1 of the reset flow: generate a 6-digit OTP and email it. Only works
// for participant (self-registered) accounts — admin accounts are
// intentionally excluded from self-service password reset.
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Please enter a valid email address" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    // Always send back the same generic message whether or not the account
    // exists, and whether it's a participant or admin — this avoids leaking
    // which emails are registered, or that an email belongs to the admin.
    const genericMessage = "If a participant account with that email exists, we've sent a one-time code to it.";

    if (!user || user.role !== "participant") {
      return res.json({ success: true, message: genericMessage });
    }

    const otp = generateOtp();
    user.resetPasswordOTP = hashOtp(otp);
    user.resetPasswordOTPExpires = Date.now() + 10 * 60 * 1000; // valid for 10 minutes
    user.resetPasswordVerified = false;
    await user.save();

    try {
      await sendEmail({
        to: user.email,
        subject: "Your Independence Day Portal password reset code",
        text: `Your one-time code is ${otp}. It expires in 10 minutes. If you didn't request this, you can ignore this email.`,
        html: `<p>Hi ${user.name},</p><p>Your one-time code to reset your Independence Day Portal password is:</p><p style="font-size:28px;font-weight:bold;letter-spacing:6px;">${otp}</p><p>This code expires in 10 minutes. If you didn't request this, you can safely ignore this email.</p>`,
      });
      console.log("📧 Password reset OTP email sent to:", user.email);
      return res.json({ success: true, message: genericMessage });
    } catch (emailErr) {
      // Email isn't configured yet (or sending failed) — fall back to
      // logging + returning the OTP directly so the flow stays testable
      // locally. See backend/utils/sendEmail.js and .env.example.
      console.warn("⚠️  Could not send OTP email:", emailErr.message);
      console.log("🔑 Password reset OTP (would normally be emailed):", otp);
      return res.json({ success: true, message: genericMessage, devOtp: otp });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/auth/verify-otp
// Step 2: check the code the user typed against the hashed OTP on file.
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and code are required" });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
      role: "participant",
      resetPasswordOTP: hashOtp(otp),
      resetPasswordOTPExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "That code is incorrect or has expired." });
    }

    user.resetPasswordVerified = true;
    await user.save();

    res.json({ success: true, message: "Code verified. You can now set a new password." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/auth/reset-password
// Step 3: only allowed once the OTP for this email has been verified
// (and hasn't expired since) — never touches admin accounts.
const resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({
      email: (email || "").toLowerCase(),
      role: "participant",
      resetPasswordVerified: true,
      resetPasswordOTPExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Your verification has expired. Please restart the password reset process.",
      });
    }

    user.password = password; // the pre("save") hook on User hashes this
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpires = undefined;
    user.resetPasswordVerified = false;
    await user.save();

    res.json({ success: true, message: "Password reset successful. You can now log in with your new password." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { registerUser, loginUser, getMe, forgotPassword, verifyOtp, resetPassword };
