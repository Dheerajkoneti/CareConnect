// server/models/Feedback.js
const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    volunteerId: { type: mongoose.Schema.Types.ObjectId, ref: "Volunteer" },
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Feedback || mongoose.model("Feedback", feedbackSchema);
