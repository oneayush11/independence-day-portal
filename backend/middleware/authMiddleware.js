
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Verify JWT token and attach user to req
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
      if (!req.user) {
        return res.status(401).json({ success: false, message: "User not found" });
      }
      return next();
    } catch (error) {
      return res.status(401).json({ success: false, message: "Not authorized, token invalid" });
    }
  }

  return res.status(401).json({ success: false, message: "Not authorized, no token" });
};

// Restrict to admin only
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  return res.status(403).json({ success: false, message: "Admin access only" });
};

// Like protect, but never rejects the request — if a valid token is present
// it attaches req.user, otherwise req.user stays undefined and the request
// continues as an anonymous visitor. Used for routes that behave differently
// for logged-in vs anonymous users (e.g. quiz list filtering).
const optionalAuth = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      const token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
    } catch (error) {
      req.user = undefined; // invalid/expired token — treat as anonymous
    }
  }
  next();
};

module.exports = { protect, adminOnly, optionalAuth };