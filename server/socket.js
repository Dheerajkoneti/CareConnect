const onlineUsers = new Map();

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("🟢 Socket connected:", socket.id);

    // REGISTER USER
    socket.on("register-user", (userId) => {
      onlineUsers.set(userId, socket.id);
      console.log("✅ User registered:", userId);
      io.emit("status-update", { userId, status: "online" });
    });

    // CALL USER
    socket.on("call-user", ({ toUserId, fromUser, roomId }) => {
      const targetSocket = onlineUsers.get(toUserId);

      if (targetSocket) {
        io.to(targetSocket).emit("incoming-call", {
          fromUser,
          roomId,
          timestamp: Date.now(),
        });
      } else {
        socket.emit("call-rejected");
      }
    });

    // ACCEPT CALL
    socket.on("call-accepted", ({ toUserId, roomId }) => {
      const socketId = onlineUsers.get(toUserId);
      if (socketId) {
        io.to(socketId).emit("call-accepted", { roomId });
      }
    });

    // REJECT CALL
    socket.on("call-rejected", ({ toUserId }) => {
      const socketId = onlineUsers.get(toUserId);
      if (socketId) {
        io.to(socketId).emit("call-rejected");
      }
    });

    // DISCONNECT
    socket.on("disconnect", () => {
      for (let [userId, sockId] of onlineUsers.entries()) {
        if (sockId === socket.id) {
          onlineUsers.delete(userId);
          io.emit("status-update", { userId, status: "offline" });
          break;
        }
      }
      console.log("🔴 Socket disconnected:", socket.id);
    });
  });
};