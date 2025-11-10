// server/routes/contentRoutes.js (CORRECTED CODE)
const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getWellnessTips, getCommunityResources } = require('../controllers/contentController'); 

// CRITICAL FIX: Initialize the router object here
const router = express.Router(); 

// Fetch all wellness tips
router.get('/tips', protect, getWellnessTips); 

// Fetch all community resources
router.get('/resources', protect, getCommunityResources); 

module.exports = router;