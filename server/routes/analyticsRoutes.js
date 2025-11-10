const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { getUserAnalytics } = require("../controllers/analyticsController");

router.get("/user/:userId", protect, getUserAnalytics);

module.exports = router;
