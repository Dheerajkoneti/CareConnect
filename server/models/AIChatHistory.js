// server/models/AIChatHistory.js
const mongoose = require('mongoose');

const AIChatHistorySchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    messages: [{
        role: { type: String, enum: ['user', 'ai'], required: true },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now }
    }],
    sentiment_log: [{ type: String }], // To track emotional tone over sessions
}, { 
    timestamps: true 
});

module.exports = mongoose.model('AIChatHistory', AIChatHistorySchema);