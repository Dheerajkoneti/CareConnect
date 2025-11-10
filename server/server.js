// =============================================
// ✅ CARECONNECT — MASTER BACKEND SERVER FILE
// =============================================
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
require("dotenv").config();

// ------------------------------------------------------
// ✅ FIREBASE ADMIN SDK SETUP
// ------------------------------------------------------
const admin = require("firebase-admin");

if (process.env.FIREBASE_CONFIG) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}


// ------------------------------------------------------
// ✅ Express App + HTTP Server
// ------------------------------------------------------
const app = express();
const server = http.createServer(app);

// ------------------------------------------------------
// ✅ Middleware
// ------------------------------------------------------
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Serve Uploaded Files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ------------------------------------------------------
// ✅ MongoDB Connect
// ------------------------------------------------------
mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/careconnect")
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));


// ------------------------------------------------------
// ✅ ROUTES IMPORT
// ------------------------------------------------------
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const communityRoutes = require("./routes/communityRoutes");
const aiRoutes = require("./routes/aiRoutes");
const volunteerRoutes = require("./routes/volunteerRoutes");
const internshipRoutes = require("./routes/internshipRoutes");
const statusRoutes = require("./routes/statusRoutes");
const communityChatRoutes = require("./routes/communityChatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const taskRoutes = require("./routes/taskRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes"); // ✅ new

const User = require("./models/User");
const CallLog = require("./models/CallLog"); // ✅ NEW MODEL
const moodRoutes = require("./routes/moodRoutes");
const callLogRoutes = require("./routes/callLogRoutes");


// ------------------------------------------------------
// ✅ REGISTER ROUTES
// ------------------------------------------------------
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/volunteers", volunteerRoutes);
app.use("/api/internships", internshipRoutes);
app.use("/api/status", statusRoutes);
app.use("/api/community-chat", communityChatRoutes);
app.use("/api", messageRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/analytics", analyticsRoutes); // ✅ NEW
app.use("/api/mood", moodRoutes);
app.use("/api/calllogs", callLogRoutes);


// ======================================================
// ✅ PUBLIC USER LIST FOR DIRECT CHAT
// ======================================================
app.get("/api/users/all", async (_req, res) => {
  try {
    const users = await User.find(
      {},
      {
        fullName: 1,
        name: 1,
        email: 1,
        role: 1,
        status: 1,
        customStatus: 1,
        lastActive: 1,
        profilePic: 1,
      }
    ).lean();

    res.json(users || []);
  } catch (err) {
    console.error("❌ Error in /api/users/all:", err.message);
    res.status(500).json({ error: true, message: err.message });
  }
});


// ======================================================
// ✅ SOCKET.IO — FULL REALTIME SYSTEM
// ======================================================
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ✅ Load Post Event Hooks
const postEvents = require("./socket/postEvents");
postEvents(io);

// ✅ Active Users Store
const onlineUsers = new Map();

function broadcastPresence() {
  io.emit("presence:list", Array.from(onlineUsers.values()));
}


// ✅ ✅ ✅ NEW: Store Active Call Sessions
let activeCalls = {};

io.on("connection", (socket) => {
  console.log("🔗 Socket connected:", socket.id);

  // ==================================================
  // ✅ USER SETUP
  // ==================================================
  socket.on("setup", (user) => {
    onlineUsers.set(socket.id, {
      socketId: socket.id,
      userId: user?._id,
      name: user?.name || user?.fullName || "Unknown",
      role: user?.role || "user",
      status: "active",
    });

    broadcastPresence();
  });

  // ==================================================
  // ✅ STATUS CHANGE
  // ==================================================
  socket.on("status_change", ({ status, customStatus }) => {
    const u = onlineUsers.get(socket.id);
    if (!u) return;

    u.status = status;
    u.customStatus = customStatus || "";
    onlineUsers.set(socket.id, u);
    broadcastPresence();
  });

  // ==================================================
  // ✅ DIRECT CHAT
  // ==================================================
  socket.on("send_message", (msg) => {
    io.emit("receive_message", msg);
  });

  // ==================================================
  // ✅ WEBRTC CALL LOGGING (NEW FEATURE)
  // ==================================================

  // ✅ Call started
  socket.on("call:request", (data) => {
    activeCalls[data.callId] = {
      callerId: data.from,
      receiverId: data.to,
      startedAt: new Date(),
    };
  });

  // ✅ Call ended — log it
  socket.on("call:end", async (data) => {
    const call = activeCalls[data.callId];
    if (!call) return;

    const endedAt = new Date();
    const duration = Math.round((endedAt - call.startedAt) / 1000);

    await CallLog.create({
      callerId: call.callerId,
      receiverId: call.receiverId,
      startedAt: call.startedAt,
      endedAt,
      duration,
      status: "completed",
    });

    delete activeCalls[data.callId];
  });

  // ==================================================
  // ✅ WEBRTC SIGNALING (unchanged)
  // ==================================================
  socket.on("call:request", (data) => io.to(data.to).emit("call:incoming", data));
  socket.on("call:accept", (data) => io.to(data.to).emit("call:accepted", data));
  socket.on("call:reject", (data) => io.to(data.to).emit("call:rejected", data));

  socket.on("webrtc_offer", (data) => socket.to(data.to).emit("webrtc_offer", data));
  socket.on("webrtc_answer", (data) => socket.to(data.to).emit("webrtc_answer", data));
  socket.on("webrtc_ice_candidate", (data) =>
    socket.to(data.to).emit("webrtc_ice_candidate", data)
  );

  // ==================================================
  // ✅ COMMUNITY CHAT
  // ==================================================
  socket.on("chat:new", (msg) => io.emit("chat:new", msg));
  socket.on("chat:delete", (id) => io.emit("chat:delete", id));
  socket.on("chat:edit", (msg) => io.emit("chat:edit", msg));
  socket.on("chat:reaction", (msg) => io.emit("chat:reaction", msg));
  socket.on("chat:typing", (d) => socket.broadcast.emit("chat:typing", d));
  socket.on("chat:typing_stop", (d) => socket.broadcast.emit("chat:typing_stop", d));

  socket.on("chat:seen", (userId) => io.emit("chat:seen", userId));

  // ==================================================
  // ✅ DISCONNECT
  // ==================================================
  socket.on("disconnect", () => {
    onlineUsers.delete(socket.id);
    broadcastPresence();
  });
});


// ======================================================
// ✅ Root
// ======================================================
app.get("/", (_, res) => res.send("🌐 CareConnect Backend Running"));


// ======================================================
// ✅ Start Server
// ======================================================
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`🚀 CareConnect Backend Running on Port ${PORT}`)
);
