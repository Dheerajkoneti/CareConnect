const Notification = require("../models/Notification");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("✅ TaskEvents connected:", socket.id);

    // ======================
    // TASK EVENTS (UNCHANGED)
    // ======================
    socket.on("task:new", (task) => {
      io.emit("task:new", task);
    });

    socket.on("task:update", (task) => {
      io.emit("task:update", task);
    });

    socket.on("task:delete", (taskId) => {
      io.emit("task:delete", taskId);
    });

    // ======================
    // 🔔 NOTIFICATION EVENT (NEW)
    // ======================
    socket.on("notification:send", async (data) => {
      try {
        const { receiverId, type, title, message } = data;

        // 1️⃣ Save notification to DB
        const notification = await Notification.create({
          user: receiverId,
          type,
          title,
          message,
        });

        // 2️⃣ Send real-time notification
        io.to(receiverId).emit("notification:new", notification);

      } catch (err) {
        console.error("❌ Notification error:", err.message);
      }
    });

    socket.on("disconnect", () => {
      console.log("❌ TaskEvents disconnected:", socket.id);
    });
  });
};
