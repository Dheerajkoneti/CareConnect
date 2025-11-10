const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },   // ✅ your original
    name: { type: String },                       // ✅ added for call system
    email: { type: String, required: true, unique: true },
    password: { type: String },

    role: {
      type: String,
      enum: ["admin", "volunteer", "community_member", "user"],
      default: "community_member",
    },

    bio: { type: String },
    profilePic: { type: String },

    // ✅ Added for status / presence system
    status: {
      type: String,
      enum: ["active", "away", "dnd", "offline", "automatic", "custom"],
      default: "active",
    },

    customStatus: { type: String, default: "" },

    lastActive: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
