// server/models/CommunityResource.js
const mongoose = require('mongoose');

const CommunityResourceSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true, 
        trim: true 
    },
    description: { 
        type: String, 
        required: true 
    },
    type: { // e.g., NGO, Helpline, Local Group
        type: String, 
        enum: ['NGO', 'Helpline', 'Local Group', 'Online Service'],
        default: 'NGO'
    },
    location: { 
        type: String, 
        required: true, 
        default: 'Global' 
    },
    link: { 
        type: String, 
        required: true 
    },
}, { 
    timestamps: true 
});

module.exports = mongoose.model('CommunityResource', CommunityResourceSchema);