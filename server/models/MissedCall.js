const mongoose = require("mongoose");

const MissedCallSchema = new mongoose.Schema({
  from: { type: String, required: true },
  to: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("MissedCall", MissedCallSchema);