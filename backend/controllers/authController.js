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

// @route POST /api/auth/forgot-password
// Only works for participant (self-registered) accounts — admin accounts
// are intentionally excluded from self-service password reset, as a
// deliberate security decision (admin password changes should happen
// through a trusted/manual channel, not a public form).
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
    const genericMessage =
      "If a participant account with that email exists, we've sent password reset instructions to it.";

    if (!user || user.role !== "participant") {
      return res.json({ success: true, message: genericMessage });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 30 * 60 * 1000; // valid for 30 minutes
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/reset-password/${rawToken}`;

    try {
      await sendEmail({
        to: user.email,
        subject: "Reset your Independence Day Portal password",
        text: `Hi ${user.name},\n\nWe received a request to reset your password. Click the link below (valid for 30 minutes):\n\n${resetUrl}\n\nIf you didn't request this, you can safely ignore this email.`,
        html: `
          <p>Hi ${user.name},</p>
          <p>We received a request to reset your password. Click the button below (valid for 30 minutes):</p>
          <p><a href="${resetUrl}" style="background:#FF9933;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;">Reset Password</a></p>
          <p>Or copy this link: <br/>${resetUrl}</p>
          <p style="color:#888;font-size:13px;">If you didn't request this, you can safely ignore this email.</p>
        `,
      });
      console.log("📧 Password reset email sent to:", user.email);
      return res.json({ success: true, message: genericMessage });
    } catch (emailError) {
      // Email isn't configured yet (or sending failed) — fall back to
      // logging + returning the link directly so the flow stays testable
      // locally. See backend/utils/sendEmail.js and .env.example.
      console.warn("⚠️  Could not send reset email:", emailError.message);
      console.log("🔑 Password reset link (would normally be emailed):", resetUrl);
      return res.json({ success: true, message: genericMessage, resetUrl });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/auth/reset-password/:token
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // role: "participant" here is a second safety net — even if a token
    // somehow existed on an admin account, this query would never match it.
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
      role: "participant",
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "This reset link is invalid or has expired." });
    }

    user.password = password; // the pre("save") hook on User hashes this
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ success: true, message: "Password reset successful. You can now log in with your new password." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { registerUser, loginUser, getMe, forgotPassword, resetPassword };
