const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  text: { type: String, default: "" },
  senderId: String,
  receiverId: String,
  fileURL: String,
  fileName: String,
  createdAt: { type: Date, default: Date.now }
});

// Prevent OverwriteModelError
module.exports = mongoose.models.Message || mongoose.model("Message", MessageSchema);
