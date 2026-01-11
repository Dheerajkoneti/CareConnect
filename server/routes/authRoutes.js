const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// 🟢 LOGIN
router.post("/login", authController.login);

// 🟢 REGISTER
router.post("/register", authController.register);

// 🟣 REQUEST PASSWORD RESET
router.post(
  "/request-password-reset",
  authController.requestPasswordReset
);

// 🟢 RESET PASSWORD
router.post("/reset-password", authController.resetPassword);

module.exports = router;