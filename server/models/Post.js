const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  text: { type: String, default: "" },
  fileURL: { type: String, default: "" },
  fileName: { type: String, default: "" },
  senderId: { type: String, required: true },
  receiverId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Message", MessageSchema);
