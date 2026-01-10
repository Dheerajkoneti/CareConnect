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
// ✅ GLOBAL ALLOWED ORIGINS (ONLY ONCE ❗)
// ------------------------------------------------------
const allowedOrigins = [
  "http://localhost:3000",
  "https://care-connect-gilt.vercel.app",
];

// ------------------------------------------------------
// ✅ CORS (EXPRESS)
// ------------------------------------------------------
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("CORS not allowed"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
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

// ------------------------------------------------------
// ✅ SOCKET.IO (SINGLE CONNECTION HANDLER ❗)
// ------------------------------------------------------
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Socket CORS blocked"));
    },
    credentials: true,
    methods: ["GET", "POST"],
  },
  transports: ["websocket", "polling"],
});

const postEvents = require("./socket/postEvents");
postEvents(io);

const onlineUsers = new Map();

const broadcastPresence = () => {
  io.emit("presence:list", Array.from(onlineUsers.values()));
};

io.on("connection", (socket) => {
  console.log("🔗 Socket connected:", socket.id);

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

  socket.on("status_change", ({ status, customStatus }) => {
    const u = onlineUsers.get(socket.id);
    if (!u) return;
    u.status = status;
    u.customStatus = customStatus || "";
    broadcastPresence();
  });

  socket.on("send_message", (msg) => io.emit("receive_message", msg));

  // -------- WebRTC + Voice --------
  socket.on("call:request", (d) => io.to(d.to).emit("call:incoming", d));
  socket.on("call:accept", (d) => io.to(d.to).emit("call:accepted", d));
  socket.on("call:reject", (d) => io.to(d.to).emit("call:rejected", d));
  socket.on("webrtc_offer", (d) => socket.to(d.to).emit("webrtc_offer", d));
  socket.on("webrtc_answer", (d) => socket.to(d.to).emit("webrtc_answer", d));
  socket.on("webrtc_ice_candidate", (d) =>
    socket.to(d.to).emit("webrtc_ice_candidate", d)
  );

  socket.on("voice:offer", (d) => io.to(d.to).emit("voice:offer", d));
  socket.on("voice:answer", (d) => io.to(d.to).emit("voice:answer", d));
  socket.on("voice:ice", (d) => io.to(d.to).emit("voice:ice", d));
  socket.on("voice:end", (d) => io.to(d.to).emit("voice:end", d));

  // -------- Community Chat --------
  socket.on("chat:new", (m) => io.emit("chat:new", m));
  socket.on("chat:edit", (m) => io.emit("chat:edit", m));
  socket.on("chat:delete", (id) => io.emit("chat:delete", id));
  socket.on("chat:reaction", (m) => io.emit("chat:reaction", m));
  socket.on("chat:typing", (d) => socket.broadcast.emit("chat:typing", d));
  socket.on("chat:typing_stop", (d) =>
    socket.broadcast.emit("chat:typing_stop", d)
  );
  socket.on("chat:seen", (id) => io.emit("chat:seen", id));

  socket.on("disconnect", () => {
    onlineUsers.delete(socket.id);
    broadcastPresence();
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