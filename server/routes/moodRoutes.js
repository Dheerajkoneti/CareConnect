const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const MoodLog = require("../models/MoodLog");

// ✅ Add Mood Entry
router.post("/add", protect, async (req, res) => {
  try {
    const log = await MoodLog.create({
      userId: req.user._id,
      score: req.body.score,   // ✅ FIXED
      note: req.body.note || "",
    });

    res.json({ success: true, log });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Get User Mood Logs
router.get("/user/:id", protect, async (req, res) => {
  try {
    const logs = await MoodLog.find({ userId: req.params.id }).sort({ createdAt: -1 });
    res.json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
