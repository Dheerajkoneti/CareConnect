const express = require("express");
const router = express.Router();

const User = require("../models/User");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");

// Import related models
const Post = require("../models/Post");
const Request = require("../models/Request");

// ✅ Multer setup for profile uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// ✅ JWT Middleware
const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

/* ==========================================================
   ✅ MAIN NEW ROUTE — Get ALL users (for VideoCall directory)
   ========================================================== */
router.get("/all", async (req, res) => {
  try {
    const users = await User.find(
  {},
  {
    fullName: 1,
    name: 1,
    email: 1,
    phone: 1,          // ✅ REQUIRED FOR CALLS
    role: 1,
    status: 1,
    customStatus: 1,
    lastActive: 1,
    profilePic: 1,
  }
).lean();


    res.json(users || []);
  } catch (err) {
    console.error("❌ /api/users/all failed:", err);
    res.status(500).json({ message: err.message });
  }
});

/* ==========================================================
   ✅ Update Live Status (Video Call)
   ========================================================== */
router.patch("/update-status/:id", async (req, res) => {
  try {
    const { status, customStatus } = req.body;
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      {
        status,
        customStatus: customStatus || "",
        lastActive: Date.now(),
      },
      { new: true }
    );

    res.json({ success: true, user: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ==========================================================
   ✅ YOUR EXISTING ROUTES (unchanged)
   ========================================================== */

// ✅ Get user profile
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Update profile
router.put(
  "/update-profile",
  authMiddleware,
  upload.single("profilePic"),
  async (req, res) => {
    try {
      const { fullName, bio } = req.body;
      const updateData = { fullName, bio };
      if (req.file) updateData.profilePic = `/uploads/${req.file.filename}`;

      const updatedUser = await User.findByIdAndUpdate(
        req.userId,
        updateData,
        { new: true }
      ).select("-password");

      res.json({ message: "Profile updated successfully", user: updatedUser });
    } catch (err) {
      res.status(500).json({ message: "Error updating profile", error: err.message });
    }
  }
);

// ✅ Get user's posts
router.get("/:id/posts", authMiddleware, async (req, res) => {
  try {
    const posts = await Post.find({ email: req.query.email });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Change password
router.put("/change-password", authMiddleware, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) return res.status(400).json({ message: "Old password incorrect" });

    user.password = newPassword;
    await user.save();
    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Volunteer requests
router.get("/:id/requests", authMiddleware, async (req, res) => {
  try {
    const requests = await Request.find({ volunteerId: req.params.id });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Update volunteer request
router.put("/:id/requests/:reqId", authMiddleware, async (req, res) => {
  const { status } = req.body;
  try {
    const updated = await Request.findByIdAndUpdate(
      req.params.reqId,
      { status },
      { new: true }
    );
    res.json({ message: "Request updated", request: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
