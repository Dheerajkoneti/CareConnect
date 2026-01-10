const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, default: "User" },
    name: { type: String }, // for call system
    email: { type: String, required: true, unique: true },
    password: { type: String },

    phone: {
      type: String,
      default: "",
    },

    role: {
      type: String,
      enum: ["admin", "volunteer", "community_member", "user"],
      default: "community_member",
    },

    bio: { type: String },
    profilePic: { type: String },

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

module.exports =
  mongoose.models.User || mongoose.model("User", userSchema);
