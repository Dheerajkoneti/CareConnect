// server/models/Volunteer.js
const mongoose = require("mongoose");

const VolunteerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true, // creates a unique index
    },
    phone: { type: String, trim: true, default: "" },
    skills: { type: String, trim: true, default: "" },      // e.g., "counseling, Telugu, English"
    experience: { type: String, trim: true, default: "" },  // e.g., "6 months helpline volunteer"
    status: { type: String, enum: ["available", "busy"], default: "available" },
  },
  { timestamps: true }
);

// IMPORTANT: export the model itself (NOT an object)
module.exports = mongoose.model("Volunteer", VolunteerSchema);
