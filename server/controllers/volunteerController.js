// server/controllers/volunteerController.js
exports.getAvailableVolunteers = async (req, res) => {
    try {
        // Fetch users who are marked as 'volunteer' and currently 'isOnline'
        const volunteers = await User.find({ 
            role: 'volunteer', 
            // isOnline: true // Use this later with Socket.io integration
        }).select('fullName location experience'); // Filter sensitive fields
        
        res.json(volunteers);
    } catch (error) {
        // ...
    }
};