// server/routes/feedbackRoutes.js
const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { submitFeedback } = require('../controllers/feedbackController');
const router = express.Router();

router.post('/', protect, submitFeedback);

module.exports = router;