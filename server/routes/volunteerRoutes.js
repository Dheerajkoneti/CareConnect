// server/routes/volunteerRoutes.js
const express = require("express");
const router = express.Router();
const Volunteer = require("../models/Volunteer");

// Helper to normalize strings (optional)
const safe = (v) => (typeof v === "string" ? v.trim() : "");

/**
 * POST /api/volunteers/register
 * Register a new volunteer
 */
router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, skills, experience } = req.body;

    if (!name || !email) {
      return res
        .status(400)
        .json({ success: false, message: "Name and email are required." });
    }

    // Check existing by email
    const exists = await Volunteer.findOne({ email: email.toLowerCase().trim() });
    if (exists) {
      return res
        .status(400)
        .json({ success: false, message: "Volunteer already registered with this email." });
    }

    const volunteer = await Volunteer.create({
      name: safe(name),
      email: safe(email).toLowerCase(),
      phone: safe(phone),
      skills: safe(skills),
      experience: safe(experience),
      status: "available",
    });

    return res.status(201).json({
      success: true,
      message: "Volunteer registration successful.",
      volunteer,
    });
  } catch (err) {
    // Duplicate index error safety
    if (err && err.code === 11000) {
      return res
        .status(400)
        .json({ success: false, message: "Email already registered." });
    }
    console.error("❌ Error registering volunteer:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
});

/**
 * GET /api/volunteers/list
 * List volunteers (simple)
 */
router.get("/list", async (req, res) => {
  try {
    const volunteers = await Volunteer.find({})
      .select("name email phone skills experience status createdAt");
    return res.json(volunteers);
  } catch (err) {
    console.error("❌ Error fetching volunteers:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
});

/**
 * PATCH /api/volunteers/status/:id
 * Update volunteer status (available/busy)
 */
router.patch("/status/:id", async (req, res) => {
  try {
    const { status } = req.body;
    if (!["available", "busy"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status." });
    }

    const updated = await Volunteer.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Volunteer not found." });
    }

    return res.json({ success: true, volunteer: updated });
  } catch (err) {
    console.error("❌ Error updating status:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
});

/**
 * DELETE /api/volunteers/:id
 * Delete volunteer (admin use)
 */
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Volunteer.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Volunteer not found." });
    }
    return res.json({ success: true, message: "Volunteer deleted." });
  } catch (err) {
    console.error("❌ Error deleting volunteer:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
});

module.exports = router;
