// =========================
// 💜 CareConnect Auth Controller
// =========================
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const User = require("../models/User"); // ✅ Correct model import

// =========================
// 🟢 REGISTER USER
// =========================
exports.register = async (req, res) => {
  console.log("🟢 REGISTER HIT", req.body); // ✅ DEBUG

  try {
    const { fullName, name, email, password, role } = req.body;
    const finalName = fullName || name;

    const existing = await User.findOne({ email });
    if (existing) {
      return res
        .status(400)
        .json({ message: "User already exists. Please log in." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName: finalName, // ✅ FIXED
      email,
      password: hashedPassword,
      role: role || "community_member",
    });

    await newUser.save();
    console.log(`✅ Registered new user: ${email}`);

    res.status(201).json({
      message: "Registration successful! You can now log in.",
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};
// =========================
// 🟢 LOGIN USER
// =========================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("LOGIN ATTEMPT:", email);

    const user = await User.findOne({ email });
    if (!user) {
      console.log("❌ User not found");
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("❌ Invalid password");
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    console.log(`✅ Login successful for user: ${email}`);

    res.json({
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// =========================
// 🟣 REQUEST PASSWORD RESET
// =========================
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    console.log(`🔍 Password reset request for: ${email}`);

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    // 💌 Email transporter (uses Gmail App Password)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"CareConnect Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset Request - CareConnect",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #6A1B9A;">💜 CareConnect Password Reset</h2>
          <p>Hello ${user.fullName || "CareConnect Member"},</p>
          <p>We received a request to reset your CareConnect password.</p>
          <p>
            Click the button below to securely reset your password:
          </p>
          <a href="${resetLink}" 
             style="display: inline-block; background-color: #6A1B9A; color: white; 
             padding: 10px 20px; border-radius: 5px; text-decoration: none;">
             Reset Password
          </a>
          <p style="margin-top: 15px;">If you didn’t request this, please ignore this email.</p>
          <p style="margin-top: 30px;">— The CareConnect Team 💜</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    console.log(`📧 Password reset email sent successfully to: ${email}`);
    res.json({ message: "Password reset link sent successfully!" });
  } catch (err) {
    console.error("PASSWORD RESET REQUEST ERROR:", err);
    res.status(500).json({
      message:
        "Unable to send reset link. Please ensure backend/email service is running.",
      error: err.message,
    });
  }
};

// =========================
// 🟢 RESET PASSWORD
// =========================
exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(newPassword, salt);

    user.password = hashed;
    await user.save();

    console.log(`🔒 Password updated for user: ${email}`);
    res.json({ message: "Password updated successfully!" });
  } catch (err) {
    console.error("PASSWORD RESET ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
