const express = require("express");
const router = express.Router();
const { chatWithAI } = require("../controllers/aiController");
const { protect } = require("../middleware/authMiddleware");
const AIConversation = require("../models/AIConversation");

// CHAT
router.post("/chat", protect, chatWithAI);

// HISTORY (CRASH-PROOF)
router.get("/history", protect, async (req, res) => {
  try {
    // 🔐 ABSOLUTE SAFETY CHECK
    if (!req.user || !req.user._id) {
      console.error("❌ req.user missing in /ai/history");
      return res.status(401).json({ message: "Unauthorized" });
    }

    const history = await AIConversation.find({
      userId: req.user._id,
    })
      .sort({ createdAt: 1 })
      .limit(50);

    return res.status(200).json(history);
  } catch (err) {
    console.error("❌ AI history crash:", err);
    return res.status(500).json({
      message: "AI history failed (server error)",
    });
  }
});

module.exports = router;