const Task = require("../models/Task");

// ✅ Create Task
exports.createTask = async (req, res) => {
  try {
    const { title } = req.body;
    const userId = req.user._id;

    if (!title)
      return res.status(400).json({ message: "Missing title" });

    const task = await Task.create({ userId, title });
    res.status(201).json({ success: true, task });
  } catch (err) {
    console.error("❌ Create Task Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get Tasks for User
exports.getUserTasks = async (req, res) => {
  try {
    const userId = req.params.userId;
    let tasks = await Task.find({ userId }).sort({ createdAt: -1 });

    // ✅ AUTO DEFAULT TASKS
    if (tasks.length === 0) {
      const defaults = [
        "5-minute breathing exercise",
        "Memory match mind game",
        "Drink a glass of water",
        "Take 10 deep breaths",
        "Stretch for 2 minutes",
        "Positive affirmation: I am improving",
      ].map((t) => ({ userId, title: t }));

      await Task.insertMany(defaults);
      tasks = await Task.find({ userId }).sort({ createdAt: -1 });
    }

    res.json({ success: true, tasks });
  } catch (err) {
    console.error("❌ Load Tasks Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Toggle Complete
exports.toggleComplete = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ message: "Task not found" });

    task.completed = !task.completed;
    await task.save();

    res.json({ success: true, task });
  } catch (err) {
    console.error("❌ Toggle Complete Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Delete Task
exports.deleteTask = async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Deleted" });
  } catch (err) {
    console.error("❌ Delete Task Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
