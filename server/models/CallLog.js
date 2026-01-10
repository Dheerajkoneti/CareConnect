const mongoose = require("mongoose");

const callLogSchema = new mongoose.Schema(
  {
    callerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    startedAt: Date,
    endedAt: Date,
    duration: Number,
    status: {
      type: String,
      enum: ["initiated", "completed", "missed"],
      default: "initiated",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CallLog", callLogSchema);