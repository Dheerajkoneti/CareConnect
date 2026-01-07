const express = require("express");
const Notification = require("../models/Notification");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/unread-count", protect, async (req, res) => {
  const count = await Notification.countDocuments({
    user: req.user._id,
    isRead: false
  });
  res.json({ count });
});

router.get("/", protect, async (req, res) => {
  const notifications = await Notification.find({
    user: req.user._id
  }).sort({ createdAt: -1 });
  res.json(notifications);
});

router.post("/mark-read", protect, async (req, res) => {
  await Notification.updateMany(
    { user: req.user._id, isRead: false },
    { isRead: true }
  );
  res.json({ success: true });
});

module.exports = router;
