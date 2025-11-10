const Task = require("../models/Task");
const CallLog = require("../models/CallLog");
const MoodLog = require("../models/MoodLog");  // if exists
const CommunityPost = require("../models/CommunityPost");

exports.getUserAnalytics = async (req, res) => {
  try {
    const userId = req.params.userId;

    // ✅ TASK STATS
    const tasks = await Task.find({ userId });
    const completedTasks = tasks.filter(t => t.completed).length;
    const pendingTasks = tasks.length - completedTasks;

    // ✅ CALL STATS
    const calls = await CallLog.find({
      $or: [{ callerId: userId }, { receiverId: userId }],
    });

    const totalCalls = calls.length;
    const totalCallDuration = calls.reduce((sum, c) => sum + (c.duration || 0), 0);

    // ✅ COMMUNITY ACTIVITY
    const posts = await CommunityPost.find({ authorId: userId });

    // ✅ MOOD
    let moodLogs = [];
    try {
      moodLogs = await MoodLog.find({ userId });
    } catch (err) {}

    res.json({
      tasks: {
        total: tasks.length,
        completed: completedTasks,
        pending: pendingTasks,
      },

      calls: {
        total: totalCalls,
        duration: totalCallDuration,
        minutes: Math.round(totalCallDuration / 60),
      },

      community: {
        posts: posts.length,
      },

      mood: moodLogs,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Analytics error" });
  }
};
