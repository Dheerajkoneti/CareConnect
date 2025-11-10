// server/controllers/contentController.js (Minimal Structure)
const WellnessTip = require('../models/WellnessTip'); // Assuming this model exists
const CommunityResource = require('../models/CommunityResource'); // Assuming this model exists

// --- Exported function 1 (Needed for the /tips route) ---
exports.getWellnessTips = async (req, res) => {
    try {
        const tips = await WellnessTip.find({}).sort({ createdAt: -1 });
        res.status(200).json(tips);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching wellness tips.' });
    }
};

// --- Exported function 2 (Needed for the /resources route) ---
exports.getCommunityResources = async (req, res) => {
    try {
        const resources = await CommunityResource.find({}).sort({ name: 1 });
        res.status(200).json(resources);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching community resources.' });
    }
};

// You can add more controller functions here later