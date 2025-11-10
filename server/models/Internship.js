const mongoose = require("mongoose");

const InternshipSchema = new mongoose.Schema({
  name: String,
  email: String,
  college: String,
  duration: String,
  mode: String,
  experience: String,
  motivation: String,
  program: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Internship", InternshipSchema);
