const Mood = require("../models/Mood");

// ✅ Add Mood
exports.addMood = async (req, res) => {
  try {
    const { mood, note } = req.body;

    const entry = await Mood.create({
      userId: req.user._id,
      mood,
      note,
    });

    res.json({ success: true, entry });
  } catch (err) {
    console.error("❌ Add Mood Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get Mood History
exports.getUserMood = async (req, res) => {
  try {
    const logs = await Mood.find({ userId: req.params.userId }).sort({
      createdAt: -1,
    });

    res.json({ success: true, logs });
  } catch (err) {
    console.error("❌ Load Mood Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
