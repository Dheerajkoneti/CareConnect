// server/routes/aiRoutes.js
const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { chatWithAI } = require('../controllers/aiController');

const router = express.Router();

// ✅ AI Companion Chat Endpoint
// Uses your Gemini 2.0 logic inside aiController.js
router.post('/message', protect, chatWithAI);

module.exports = router;
