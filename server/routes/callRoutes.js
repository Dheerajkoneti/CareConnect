const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const CallLog = require("../models/CallLog");

// ✅ Add Call Log
router.post("/add", protect, async (req, res) => {
  try {
    const log = await CallLog.create({
      callerId: req.user._id,
      receiverId: req.body.receiverId,
      startedAt: req.body.startedAt,
      endedAt: req.body.endedAt,
      duration: req.body.duration,
      status: req.body.status || "completed",
    });

    res.json({ success: true, log });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ Get User Call Logs
router.get("/user/:id", protect, async (req, res) => {
  try {
    const logs = await CallLog.find({
      $or: [
        { callerId: req.params.id },
        { receiverId: req.params.id }
      ]
    })
      .populate("callerId", "fullName email profilePic")
      .populate("receiverId", "fullName email profilePic")
      .sort({ createdAt: -1 });

    res.json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
