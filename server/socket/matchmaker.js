// socket/matchmaker.js
import Volunteer from '../models/Volunteer.js';
import Session from '../models/Session.js';

/**
 * 🎯 Real-Time Volunteer Matchmaking and Chat Service
 * ---------------------------------------------------
 * Handles:
 * - Matching users to available volunteers
 * - Managing volunteer availability
 * - Real-time chat messages
 * - Session tracking (start/end)
 * - Auto-rematch for waiting users
 */

let waitingUsers = []; // Queue for unmatched users

export const initSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔗 New connection: ${socket.id}`);

    // 🧠 Tag socket to a role (user/volunteer)
    socket.role = null;

    /**
     * 🧓 USER REQUESTS SUPPORT
     * ---------------------------------------------------
     * A user requests emotional support -> find an available volunteer
     */
    socket.on('user_request_support', async (userData) => {
      try {
        console.log(`🧠 Support requested by ${userData.name}`);

        // Mark socket as a user
        socket.role = 'user';
        socket.userData = userData;

        // Find available volunteer
        const volunteer = await Volunteer.findOne({ status: 'available' });

        if (volunteer) {
          const room = `session_${socket.id}_${volunteer._id}`;
          socket.join(room);

          // Update volunteer to busy
          await Volunteer.updateOne({ _id: volunteer._id }, { status: 'busy' });

          // Save session
          const session = new Session({
            userId: userData.id,
            volunteerId: volunteer._id,
            sessionRoom: room,
            startTime: new Date(),
          });
          await session.save();

          // Notify both
          io.to(socket.id).emit('match_found', { room, volunteer });
          io.emit('status_updated', { volunteerId: volunteer._id, status: 'busy' });

          console.log(`✅ Matched ${userData.name} ↔ ${volunteer.name} in ${room}`);
        } else {
          console.log(`❌ No volunteers available for ${userData.name}`);
          waitingUsers.push({ id: socket.id, data: userData });
          socket.emit('no_volunteer_available');
        }
      } catch (err) {
        console.error('❌ Error matching user:', err);
        socket.emit('match_error', { message: 'Something went wrong, please try again.' });
      }
    });

    /**
     * 🧑‍🤝‍🧑 VOLUNTEER STATUS UPDATE
     * ---------------------------------------------------
     * Triggered when volunteer toggles status (available/busy)
     */
    socket.on('volunteer_status_update', async ({ volunteerId, status }) => {
      try {
        await Volunteer.updateOne({ _id: volunteerId }, { status, socketId: socket.id });
        socket.role = 'volunteer';
        socket.volunteerId = volunteerId;

        console.log(`📊 Volunteer ${volunteerId} → ${status}`);
        io.emit('status_updated', { volunteerId, status });

        // If new volunteer available, check waiting queue
        if (status === 'available' && waitingUsers.length > 0) {
          const user = waitingUsers.shift();
          const room = `session_${user.id}_${volunteerId}`;
          const volunteer = await Volunteer.findById(volunteerId);

          io.to(user.id).emit('match_found', { room, volunteer });
          io.sockets.sockets.get(user.id)?.join(room);

          await Volunteer.updateOne({ _id: volunteerId }, { status: 'busy' });
          const session = new Session({
            userId: user.data.id,
            volunteerId,
            sessionRoom: room,
            startTime: new Date(),
          });
          await session.save();

          io.emit('status_updated', { volunteerId, status: 'busy' });
          console.log(`🤝 Auto-matched waiting user ${user.data.name} ↔ ${volunteer.name}`);
        }
      } catch (err) {
        console.error('❌ Error updating volunteer status:', err);
      }
    });

    /**
     * 💬 CHAT MESSAGE RELAY
     * ---------------------------------------------------
     * Relays messages between user and volunteer in a shared room
     */
    socket.on('send_message', ({ room, text, sender }) => {
      if (!room || !text) return;
      console.log(`💬 [${room}] ${sender}: ${text}`);
      io.to(room).emit('receive_message', { text, sender, time: new Date() });
    });

    /**
     * 🏁 SESSION END EVENT
     * ---------------------------------------------------
     * Either the user or volunteer ends the session
     */
    socket.on('end_session', async ({ room, volunteerId, feedback }) => {
      try {
        await Volunteer.updateOne({ _id: volunteerId }, { status: 'available' });
        await Session.updateOne(
          { sessionRoom: room },
          { feedback, endTime: new Date() }
        );

        io.to(room).emit('session_ended', { message: 'Session has ended. Thank you!' });
        io.emit('status_updated', { volunteerId, status: 'available' });

        console.log(`🏁 Session ${room} ended. Volunteer available again.`);
      } catch (err) {
        console.error('❌ Error ending session:', err);
      }
    });

    /**
     * ⚠️ HANDLE DISCONNECTION
     * ---------------------------------------------------
     * If user disconnects -> remove from queue
     * If volunteer disconnects -> mark offline
     */
    socket.on('disconnect', async () => {
      console.log(`⚠️ Socket disconnected: ${socket.id}`);

      try {
        // Remove from waiting queue
        waitingUsers = waitingUsers.filter((u) => u.id !== socket.id);

        // Mark volunteer offline if applicable
        if (socket.role === 'volunteer' && socket.volunteerId) {
          await Volunteer.updateOne(
            { _id: socket.volunteerId },
            { status: 'offline' }
          );
          io.emit('status_updated', { volunteerId: socket.volunteerId, status: 'offline' });
          console.log(`🚫 Volunteer ${socket.volunteerId} marked offline`);
        }
      } catch (err) {
        console.error('❌ Error handling disconnect:', err);
      }
    });
  });
};
