// server/models/WellnessTip.js
const mongoose = require("mongoose");

const wellnessTipSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: { type: String }, // e.g. "Mindfulness", "Sleep", etc.
    content: { type: String, required: true },
    createdBy: { type: String, default: "Admin" },
    likes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ✅ Safe export: prevents model overwrite errors
module.exports =
  mongoose.models.WellnessTip || mongoose.model("WellnessTip", wellnessTipSchema);
