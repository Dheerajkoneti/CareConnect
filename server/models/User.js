const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    /* =========================
       BASIC INFO
    ========================= */
    fullName: {
      type: String,
      required: true,
      default: "User",
      trim: true,
    },

    name: {
      type: String, // legacy / call display
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      default: "",
    },

    profilePic: {
      type: String,
      default: "",
    },

    bio: {
      type: String,
      default: "",
    },

    /* =========================
       ROLE & ACCESS
    ========================= */
    role: {
      type: String,
      enum: ["admin", "volunteer", "community_member", "user"],
      default: "community_member",
    },

    /* =========================
       PRESENCE & STATUS
    ========================= */
    status: {
      type: String,
      enum: ["active", "away", "dnd", "offline", "busy", "ringing"],
      default: "active",
    },

    customStatus: {
      type: String,
      default: "",
    },

    lastActive: {
      type: Date,
      default: Date.now,
    },

    isOnline: {
      type: Boolean,
      default: false,
    },

    /* =========================
       CALL & VIDEO SYSTEM
    ========================= */
    socketId: {
      type: String,
      default: null, // current socket connection
    },

    inCall: {
      type: Boolean,
      default: false,
    },

    currentCallRoom: {
      type: String,
      default: null,
    },

    callType: {
      type: String,
      enum: ["voice", "video", null],
      default: null,
    },

    /* =========================
       PUSH NOTIFICATIONS (FCM)
    ========================= */
    fcmToken: {
      type: String,
      default: null,
    },

    notificationsEnabled: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

/* =========================
   INDEXES (PERFORMANCE)
========================= */
userSchema.index({ email: 1 });
userSchema.index({ socketId: 1 });
userSchema.index({ isOnline: 1 });

module.exports =
  mongoose.models.User || mongoose.model("User", userSchema);