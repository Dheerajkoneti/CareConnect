const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

const {
  createTask,
  getUserTasks,
  toggleComplete,
  deleteTask,
} = require("../controllers/taskController");

// ✅ CREATE TASK
router.post("/create", protect, createTask);

// ✅ GET ALL TASKS FOR USER
router.get("/user/:userId", protect, getUserTasks);

// ✅ TOGGLE COMPLETE
router.put("/:id/complete", protect, toggleComplete);

// ✅ DELETE TASK
router.delete("/:id", protect, deleteTask);

module.exports = router;
