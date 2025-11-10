const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const CallLog = require("../models/CallLog");

// ✅ Fetch call logs
router.get("/user/:id", protect, async (req, res) => {
  try {
    const logs = await CallLog.find({
      $or: [
        { callerId: req.params.id },
        { receiverId: req.params.id }
      ]
    }).sort({ createdAt: -1 });

    res.json({ success: true, logs });
  } catch (error) {
    console.error("❌ Load Call Logs Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
