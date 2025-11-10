// server/models/ActiveUser.js
const mongoose = require("mongoose");

const ActiveUserSchema = new mongoose.Schema({
  socketId: { type: String, required: true },
  userId: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ["community_member", "volunteer"], default: "community_member" },
  lastActive: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ActiveUser", ActiveUserSchema);
