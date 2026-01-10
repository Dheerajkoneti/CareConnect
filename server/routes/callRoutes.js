const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const CallLog = require("../models/CallLog");

// ✅ Add Call Log
router.post("/add", protect, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const log = await CallLog.create({
      callerId: req.user._id,
      receiverId: req.body.receiverId || req.user._id,
      startedAt: req.body.startedAt || new Date(),
      endedAt: req.body.endedAt || new Date(),
      duration: req.body.duration || 0,
      status: req.body.status || "initiated",
    });

    res.json({ success: true, log });
  } catch (err) {
    console.error("❌ CALL ADD ERROR:", err);
    res.status(500).json({
      message: "Failed to create call log",
      error: err.message,
    });
  }
});


// ✅ Get User Call Logs
router.get("/user/:id", protect, async (req, res) => {
  try {
    const logs = await CallLog.find({
      $or: [{ callerId: req.params.id }, { receiverId: req.params.id }],
    })
      .populate("callerId", "fullName email profilePic phone")
      .populate("receiverId", "fullName email profilePic phone")
      .sort({ createdAt: -1 });

    res.json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
