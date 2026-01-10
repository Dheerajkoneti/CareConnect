const mongoose = require("mongoose");

const AIConversationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "ai", "system"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// 🔥 FORCE collection name to avoid Linux mismatch
module.exports = mongoose.model(
  "AIConversation",
  AIConversationSchema,
  "ai_conversations"
);