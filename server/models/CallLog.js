const mongoose = require("mongoose");

const CallLogSchema = new mongoose.Schema(
  {
    callerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    startedAt: Date,
    endedAt: Date,
    duration: Number,
    status: { type: String, default: "completed" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("CallLog", CallLogSchema);
