const express = require("express");
const router = express.Router();
const { chatWithAI } = require("../controllers/aiController");
const { protect } = require("../middleware/authMiddleware");

// Protected AI route
router.post("/chat", protect, chatWithAI);
router.get("/history", protect, async (req, res) => {
  const history = await AIConversation.find({ userId: req.user._id })
    .sort({ createdAt: 1 })
    .limit(50);
  res.json(history);
});


module.exports = router;
