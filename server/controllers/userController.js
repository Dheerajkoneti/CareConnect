const User = require('../models/User'); // Assuming this path is correct

// --- 1. Get All Users Controller (New function for /api/users/all) ---
const getAllUsers = async (req, res) => {
    try {
        // Fetch all users, selecting fields needed for chat list, including 'username'
        const users = await User.find({})
            .select('_id name email role username') // ✨ Added 'username' here ✨
            .lean(); 

        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching all users for chat list:", error);
        res.status(500).json({ message: "Failed to retrieve user list." });
    }
};

// --- 2. Get User Profile Controller (Required for GET routes) ---
const getUserProfile = async (req, res) => {
    const userId = req.params.userId;
    try {
        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(400).json({ message: 'Invalid user ID format.' });
    }
};

// --- 3. Follow/Unfollow User Controller (Existing logic) ---
const followUser = async (req, res) => {
    const currentUserId = req.user._id; 
    const targetUserId = req.params.userId;
    const { action } = req.body; 

    if (currentUserId.toString() === targetUserId.toString()) {
        return res.status(400).json({ message: 'You cannot follow yourself.' });
    }

    try {
        let targetUserUpdate = {};
        let currentUserUpdate = {};

        if (action === 'follow') {
            targetUserUpdate = { $addToSet: { followers: currentUserId } };
            currentUserUpdate = { $addToSet: { following: targetUserId } };
        } else if (action === 'unfollow') {
            targetUserUpdate = { $pull: { followers: currentUserId } };
            currentUserUpdate = { $pull: { following: targetUserId } };
        } else {
             return res.status(400).json({ message: 'Invalid action specified.' });
        }

        await User.findByIdAndUpdate(targetUserId, targetUserUpdate, { new: true });
        const currentUser = await User.findByIdAndUpdate(currentUserId, currentUserUpdate, { new: true });

        const isFollowing = currentUser.following.includes(targetUserId);

        res.status(200).json({ 
            message: `Successfully ${action}ed user.`,
            isFollowing: isFollowing,
        });

    } catch (error) {
        console.error(`Error during ${action} action:`, error.message);
        res.status(500).json({ message: `Server error during ${action} action.` });
    }
};


// --- FINAL EXPORT METHOD ---
module.exports = {
    getAllUsers,     // Export the new function
    getUserProfile,
    followUser,      
};