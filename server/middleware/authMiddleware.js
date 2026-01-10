// server/middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  // 1. Check Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Extract token
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user (without password)
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res
          .status(401)
          .json({ message: "Not authorized, user not found" });
      }

      return next(); // ✅ IMPORTANT
    } catch (error) {
      console.error("TOKEN VERIFICATION FAILED:", error.message);
      return res
        .status(401)
        .json({ message: "Not authorized, token failed or expired" });
    }
  }

  // ❗ MUST RETURN HERE
  return res
    .status(401)
    .json({ message: "Not authorized, no token provided" });
};

module.exports = { protect };
