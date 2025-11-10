module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("✅ TaskEvents connected:", socket.id);

    socket.on("task:new", (task) => {
      io.emit("task:new", task);
    });

    socket.on("task:update", (task) => {
      io.emit("task:update", task);
    });

    socket.on("task:delete", (taskId) => {
      io.emit("task:delete", taskId);
    });

    socket.on("disconnect", () => {
      console.log("❌ TaskEvents disconnected:", socket.id);
    });
  });
};
