const express = require("express");
const router = express.Router();
const Internship = require("../models/Internship");

/**
 * 🎓 Apply for Internship
 * POST /api/internships/apply
 */
router.post("/apply", async (req, res) => {
  try {
    const newApplication = new Internship(req.body);
    await newApplication.save();

    res.json({
      success: true,
      message: "Internship application submitted",
      application: newApplication,
    });
  } catch (err) {
    console.error("❌ Internship Error: ", err.message);
    res.status(500).json({ success: false, message: "Failed to apply internship" });
  }
});

/**
 * 📋 Get All Internship Applications
 * GET /api/internships/list
 * (Useful for admin panel)
 */
router.get("/list", async (req, res) => {
  try {
    const list = await Internship.find();
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: "Error fetching internship list" });
  }
});

module.exports = router;
