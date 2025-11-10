// server/controllers/feedbackController.js
const Feedback = require('../models/Feedback');

exports.submitFeedback = async (req, res) => {
    const { rating, comment } = req.body;
    const userId = req.user._id; // Retrieved securely from 'protect' middleware

    try {
        const newFeedback = new Feedback({
            user: userId,
            rating,
            comment,
            // Automatically mark as an issue if rating is low
            issue: rating <= 2,
        });

        await newFeedback.save();
        res.status(201).json({ message: 'Feedback received successfully!' });
    } catch (error) {
        console.error("Feedback error:", error);
        res.status(500).json({ message: 'Failed to submit feedback.' });
    }
};