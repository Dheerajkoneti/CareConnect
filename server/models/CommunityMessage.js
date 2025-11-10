const mongoose = require("mongoose");

const CommunityMessageSchema = new mongoose.Schema(
  {
    senderId: { type: String, required: true },
    senderName: { type: String, required: true },
    text: { type: String, default: "" },
    fileUrl: { type: String, default: "" },
    fileType: { type: String, default: "" }, // image/pdf/doc
    seenBy: { type: [String], default: [] }, // userIds who have seen it
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.CommunityMessage ||
  mongoose.model("CommunityMessage", CommunityMessageSchema);
