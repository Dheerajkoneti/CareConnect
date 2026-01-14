// =============================================
// ✅ CARECONNECT — MASTER BACKEND SERVER FILE
// =============================================
const path = require("path");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
const session = require("express-session");
const passport = require("passport");
require("dotenv").config();
require("./config/passport");

// ------------------------------------------------------
// ✅ FIREBASE ADMIN SDK SETUP
// ------------------------------------------------------
const admin = require("firebase-admin");

if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  throw new Error("❌ FIREBASE_SERVICE_ACCOUNT_KEY is missing");
}

const serviceAccount = JSON.parse(
  Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_KEY, "base64").toString("utf8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

console.log("✅ Firebase Admin Initialized (prod)");

// ------------------------------------------------------
// ✅ EXPRESS + HTTP SERVER
// ------------------------------------------------------
const app = express();
const server = http.createServer(app);

// ------------------------------------------------------
// ✅ SINGLE CORS CONFIG (FIXED)
// ------------------------------------------------------
const allowedOrigins = [
  "http://localhost:3000",
  "https://careconnect-dini.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(null, true); // allow safely
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.options("*", cors());
app.use(express.json());
// ------------------------------------------------------
// ✅ SESSION + PASSPORT (FIXED FOR RENDER)
// ------------------------------------------------------
app.set("trust proxy", 1);

app.use(
  session({
    secret: process.env.SESSION_SECRET || "careconnectsecret123",
    resave: false,
    saveUninitialized: false,
    proxy: true,
    cookie: {
      secure: true,
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// ------------------------------------------------------
// ✅ STATIC FILES
// ------------------------------------------------------
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ------------------------------------------------------
// ✅ MONGODB
// ------------------------------------------------------
mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/careconnect")
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// ------------------------------------------------------
// ✅ ROUTES
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
app.use("/api/calls", require("./routes/callRoutes"));

// ------------------------------------------------------
// ✅ PUBLIC USER LIST
// ------------------------------------------------------
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
// ===============================
// SOCKET.IO – FULL REALTIME SYSTEM
// ===============================
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "https://careconnect-dini.vercel.app",
    ],
    credentials: true,
  },
  transports: ["websocket"],
});
const postEvents = require("./socket/postEvents");
postEvents(io);
const onlineUsers = new Map();
function broadcastPresence() {
  io.emit("presence:list", Array.from(onlineUsers.values()));
}
io.on("connection", (socket) => {
  console.log("🔗 Socket connected:", socket.id);
  socket.on("join_room", ({ room, user }) => {
    socket.join(room);
      onlineUsers.set(socket.id, {
        socketId: socket.id,
        userId: user._id,
        name: user.name,
        role: user.role,
        status: "active",
      });
    broadcastPresence();
  });
  // ✅ REGISTER USER (CRITICAL)
  socket.on("register-user", async (userId) => {
    try {
      await User.findByIdAndUpdate(userId, {
        socketId: socket.id,
        isOnline: true,
        status: "active",
        lastActive: new Date(),
      });

      console.log("✅ REGISTERED:", userId, socket.id);
    } catch (err) {
      console.error("❌ register-user error:", err.message);
    }
  });

  // ===============================
  // 📞 CALL USER
  // ===============================
  socket.on("call-user", async ({ toUserId, fromUser, roomId }) => {
    console.log("📞 CALL:", fromUser, "→", toUserId);

    const receiver = await User.findById(toUserId);

    if (!receiver?.socketId) {
      console.log("❌ RECEIVER OFFLINE:", toUserId);
      return;
    }

    io.to(receiver.socketId).emit("incoming-call", {
      fromUser,
      roomId,
    });

    console.log("🚀 incoming-call sent");
  });

  // ===============================
  // ✅ ACCEPT CALL
  // ===============================
  socket.on("call-accepted", async ({ toUserId, roomId }) => {
    const caller = await User.findById(toUserId);

    if (caller?.socketId) {
      io.to(caller.socketId).emit("call-accepted", { roomId });
    }
  });

  // ===============================
  // ❌ REJECT CALL
  // ===============================
  socket.on("call-rejected", async ({ toUserId }) => {
    const caller = await User.findById(toUserId);

    if (caller?.socketId) {
      io.to(caller.socketId).emit("call-rejected");
    }
  });

  // ===============================
  // 🔴 DISCONNECT
  // ===============================
  socket.on("disconnect", async () => {
    onlineUsers.delete(socket.id);
    broadcastPresence();
    await User.findOneAndUpdate(
      { socketId: socket.id },
      {
        socketId: null,
        isOnline: false,
        status: "offline",
        lastActive: new Date(),
      }
    );
    console.log("❌ Socket disconnected:", socket.id);
  });
});
// ------------------------------------------------------
// ✅ ROOT
// ------------------------------------------------------
app.get("/", (_, res) => res.send("🌐 CareConnect Backend Running"));

// ------------------------------------------------------
// ✅ START SERVER
// ------------------------------------------------------
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`🚀 CareConnect Backend Running on Port ${PORT}`)
);
// 🧯 GLOBAL ERROR HANDLER (PREVENTS 502 CRASHES)
app.use((err, req, res, next) => {
  console.error("🔥 GLOBAL ERROR:", err.message);
  res.status(500).json({ message: "Internal server error" });
});