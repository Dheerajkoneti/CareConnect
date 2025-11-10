// server/socket/socketHandler.js
// Modular Socket.IO handler for matchmaking + volunteer invites

const Volunteer = require("../models/Volunteer");
const Session = require("../models/Session");

module.exports = function socketHandler(io) {
  console.log("🔌 Initializing Socket.IO handler");

  // Map volunteerId -> socketId
  const volunteerSockets = new Map();

  // optional: map socketId -> volunteerId for cleanup
  const socketToVolunteer = new Map();

  io.on("connection", (socket) => {
    console.log(`🔗 Socket connected: ${socket.id}`);

    // When a volunteer client connects they should register themselves:
    // socket.emit('volunteer_register', { volunteerId: '...'})
    socket.on("volunteer_register", async ({ volunteerId }) => {
      if (!volunteerId) return;
      volunteerSockets.set(volunteerId, socket.id);
      socketToVolunteer.set(socket.id, volunteerId);
      console.log(`📌 Volunteer registered: ${volunteerId} -> ${socket.id}`);

      // Optionally update DB socketId or status
      try {
        await Volunteer.findByIdAndUpdate(volunteerId, { status: "available", socketId: socket.id });
      } catch (e) { /* ignore */ }
      // broadcast new status
      io.emit("status_updated", { volunteerId, status: "available" });
    });

    // When a volunteer toggles status using dashboard (also support HTTP PATCH)
    socket.on("volunteer_status_update", async ({ volunteerId, status }) => {
      try {
        await Volunteer.findByIdAndUpdate(volunteerId, { status });
      } catch (e) { /* ignore */ }
      io.emit("status_updated", { volunteerId, status });
    });

    // User requests volunteer invite (send notification to volunteer)
    // payload: { volunteerId, userId, userName, type: 'chat'|'call' }
    socket.on("invite_volunteer", async (payload) => {
      try {
        const { volunteerId, userId, userName, type } = payload;
        console.log(`🔔 Invite from user ${userName} -> volunteer ${volunteerId} (type=${type})`);
        const volunteerSocketId = volunteerSockets.get(volunteerId);

        if (!volunteerSocketId) {
          // volunteer offline: notify requester
          socket.emit("invite_failed", { reason: "Volunteer offline" });
          return;
        }

        // Build a request id or room name
        const requestId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

        // send incoming request to volunteer socket
        io.to(volunteerSocketId).emit("incoming_request", {
          requestId,
          from: { userId, userName },
          type,
          requestedAt: new Date().toISOString(),
        });

        // Inform requester that invite was forwarded
        socket.emit("invite_forwarded", { requestId });
      } catch (err) {
        console.error("Error in invite_volunteer:", err);
        socket.emit("invite_failed", { reason: "Server error" });
      }
    });

    // Volunteer responds to the incoming request
    // payload: { requestId, volunteerId, userId, accept: true/false, type }
    socket.on("invite_response", async ({ requestId, volunteerId, userId, accept, type }) => {
      try {
        const volunteerSocketId = socket.id; // responder's socket
        const requesterSocket = null;

        // Find requestor: if we stored mapping for request id earlier (no storage here),
        // we'll instead broadcast to all sockets with matching userId (or store mapping on invite_volunteer)
        // Simpler approach: emit to all sockets with `userId` in namespace; here we rely on the requester still being connected
        // For consistency: We'll emit to all sockets and client will handle ignoring if requestId mismatch.

        // If accepted -> create a session room and notify both sides
        if (accept) {
          // room id
          const room = `session_${requestId}`;

          // Persist session to DB (optional)
          try {
            const session = new Session({
              userId,
              volunteerId,
              sessionRoom: room,
            });
            await session.save();
          } catch (e) {
            // ignore DB errors but log
            console.warn("⚠️ Session save error:", e.message);
          }

          // Notify volunteer (self)
          io.to(volunteerSocketId).emit("invite_accepted_local", { requestId, room, volunteerId, userId, type });

          // Notify requester(s)
          // Send to all sockets (io.sockets.sockets) and rely on client userId match.
          io.emit("invite_accepted", { requestId, room, volunteerId, userId, type });
          // Optionally have server join volunteer to room (the volunteer socket)
          socket.join(room);

          console.log(`✅ Invite accepted: ${requestId} - room ${room}`);
        } else {
          // declined
          io.emit("invite_declined", { requestId, volunteerId, userId, type });
          console.log(`❌ Invite declined: ${requestId} by volunteer ${volunteerId}`);
        }
      } catch (err) {
        console.error("Error in invite_response:", err);
      }
    });

    // Simple passthrough chat message relay
    socket.on("send_message", ({ room, text, sender }) => {
      console.log(`💬 [${room}] ${sender}: ${text}`);
      io.to(room).emit("receive_message", { text, sender, time: new Date().toISOString() });
    });

    // Handle session end
    socket.on("end_session", async ({ room, volunteerId, feedback }) => {
      try {
        await Volunteer.findByIdAndUpdate(volunteerId, { status: "available" });
      } catch (e) {}
      io.to(room).emit("session_ended", { message: "Session ended." });
      io.emit("status_updated", { volunteerId, status: "available" });
    });

    // On disconnect cleanup
    socket.on("disconnect", async () => {
      console.log(`⚠️ Socket disconnected: ${socket.id}`);
      const volId = socketToVolunteer.get(socket.id);
      if (volId) {
        volunteerSockets.delete(volId);
        socketToVolunteer.delete(socket.id);
        try {
          await Volunteer.findByIdAndUpdate(volId, { status: "offline", socketId: null });
        } catch (e) {}
        io.emit("status_updated", { volunteerId: volId, status: "offline" });
      }
    });
  });
};
