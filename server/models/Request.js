const mongoose = require("mongoose");

const RequestSchema = new mongoose.Schema({
  volunteerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Volunteer who will receive the request
  userEmail: { type: String, required: true }, // User who sent the request
  message: { type: String, required: true },
  status: { 
    type: String, 
    enum: ["pending", "accepted", "rejected"], 
    default: "pending" 
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Request", RequestSchema);
