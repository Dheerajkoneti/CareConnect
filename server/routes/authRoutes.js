// server/routes/authRoutes.js
const express = require("express");
const router = express.Router();
const {
  register,
  login,
  requestPasswordReset,
  resetPassword,
} = require("../controllers/authController");

// 🟣 Register new user
router.post("/register", register);

// 🟣 Login user
router.post("/login", login);

// 🟣 Request password reset (send email link)
router.post("/request-password-reset", requestPasswordReset);

// 🟣 Reset password using token
router.post("/reset-password", resetPassword);

module.exports = router;
