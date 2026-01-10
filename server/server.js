// =============================================
// ✅ CARECONNECT — MASTER BACKEND SERVER FILE
// =============================================
const path = require("path");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
const session = require("express-session");   // ✅ Added
const passport = require("passport");         // ✅ Required for OAuth
require("dotenv").config();
require("./config/passport"); // ✅ Load Google OAuth Strategy
// ------------------------------------------------------
// ✅ FIREBASE ADMIN SDK SETUP (LOCAL + PRODUCTION SAFE)
// ------------------------------------------------------
const admin = require("firebase-admin");
const fs = require("fs");   // ✅ fs only, NO path here

if (process.env.NODE_ENV === "production") {
  const serviceAccount = JSON.parse(
    Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, "base64").toString("utf8")
  );

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  console.log("✅ Firebase Admin Initialized (prod)");
} else {
  const serviceAccount = JSON.parse(
    fs.readFileSync("./serviceAccountKey.json", "utf8")
  );

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  console.log("✅ Firebase Admin Initialized (local)");
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
    origin: [
      "http://localhost:3000",
      "https://care-connect-ecru.vercel.app",
      "https://care-connect-wps.vercel.app",
    ],
    credentials: true,
  })
);
app.use(express.json());

// ✅ Session + Passport Middleware (REQUIRED for Google OAuth)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "careconnectsecret123",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true,        // REQUIRED on HTTPS (Render)
      sameSite: "none",    // REQUIRED for cross-site cookies
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

// ✅ Serve uploaded files (Direct Chat + Community)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ------------------------------------------------------
// ✅ MongoDB Connect
// ------------------------------------------------------
mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/careconnect")
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));


// ------------------------------------------------------
// ✅ ALL EXISTING ROUTES
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
const communityFeedRoutes = require("./routes/communityFeedRoutes");
const taskRoutes = require("./routes/taskRoutes");
const callRoutes = require("./routes/callRoutes");
const moodRoutes = require("./routes/moodRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const User = require("./models/User");

// ✅ Register all API routes
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
app.use("/api/community", communityFeedRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/calls", callRoutes);
app.use("/api/mood", moodRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/ai", aiRoutes);
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
    origin: [
      "http://localhost:3000",
      "https://care-connect-ecru.vercel.app",
      "https://care-connect-wps.vercel.app",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});
// ✅ Real-Time Post Events (likes, comments, edits, deletes)
const postEvents = require("./socket/postEvents");
postEvents(io);

const onlineUsers = new Map();

function broadcastPresence() {
  io.emit("presence:list", Array.from(onlineUsers.values()));
}

io.on("connection", (socket) => {
  console.log("🔗 Socket connected:", socket.id);

  // ✅ USER SETUP
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

  // ✅ STATUS CHANGE
  socket.on("status_change", ({ status, customStatus }) => {
    const u = onlineUsers.get(socket.id);
    if (!u) return;

    u.status = status;
    u.customStatus = customStatus || "";
    onlineUsers.set(socket.id, u);
    broadcastPresence();
  });

  // ✅ DIRECT MESSAGES
  socket.on("send_message", (msg) => {
    io.emit("receive_message", msg);
  });

  // ✅ WEBRTC CALLING
  socket.on("call:request", (data) => io.to(data.to).emit("call:incoming", data));
  socket.on("call:accept", (data) => io.to(data.to).emit("call:accepted", data));
  socket.on("call:reject", (data) => io.to(data.to).emit("call:rejected", data));

  socket.on("webrtc_offer", (data) => socket.to(data.to).emit("webrtc_offer", data));
  socket.on("webrtc_answer", (data) => socket.to(data.to).emit("webrtc_answer", data));
  socket.on("webrtc_ice_candidate", (data) =>
    socket.to(data.to).emit("webrtc_ice_candidate", data)
  );

  // ✅ COMMUNITY CHAT
  socket.on("chat:new", (msg) => io.emit("chat:new", msg));
  socket.on("chat:delete", (id) => io.emit("chat:delete", id));
  socket.on("chat:edit", (msg) => io.emit("chat:edit", msg));
  socket.on("chat:reaction", (msg) => io.emit("chat:reaction", msg));
  socket.on("chat:typing", (data) => socket.broadcast.emit("chat:typing", data));
  socket.on("chat:typing_stop", (data) =>
    socket.broadcast.emit("chat:typing_stop", data)
  );

  socket.on("chat:seen", (userId) => io.emit("chat:seen", userId));

  // ✅ DISCONNECT
  socket.on("disconnect", () => {
    onlineUsers.delete(socket.id);
    broadcastPresence();
  });
});
io.on("connection", (socket) => {
  console.log("🔗 Socket connected:", socket.id);

  // ================= VOICE CALL SIGNALING =================

  socket.on("voice:offer", ({ to, offer }) => {
    io.to(to).emit("voice:offer", {
      from: socket.id,
      offer,
    });
  });

  socket.on("voice:answer", ({ to, answer }) => {
    io.to(to).emit("voice:answer", {
      from: socket.id,
      answer,
    });
  });

  socket.on("voice:ice", ({ to, candidate }) => {
    io.to(to).emit("voice:ice", {
      from: socket.id,
      candidate,
    });
  });

  socket.on("voice:end", ({ to }) => {
    io.to(to).emit("voice:end");
  });

  // ================= EXISTING SOCKET EVENTS =================
  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.id);
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
