const mongoose = require("mongoose");

const CommunityChatSchema = new mongoose.Schema(
  {
    senderId: { type: String, required: true },
    senderName: { type: String, required: true },
    message: { type: String, default: "" },
    imageUrl: { type: String, default: null },
    reactions: { type: Object, default: {} },
    seenBy: { type: [String], default: [] },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.CommunityChatMessage ||
  mongoose.model("CommunityChatMessage", CommunityChatSchema);
