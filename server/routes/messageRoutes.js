// ===============================================
// ✅ MESSAGE ROUTES FOR CARECONNECT CHAT SYSTEM
// ===============================================
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Message = require("../models/Message");

// ✅ Ensure uploads folder exists
const uploadFolder = path.join(__dirname, "uploads");
const fs = require("fs");
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder);
}

// ✅ Multer Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadFolder);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });


// ====================================================
// ✅ GET CHAT MESSAGES  (Frontend calls this)
// ====================================================
router.get("/messages/:sender/:receiver", async (req, res) => {
  try {
    const { sender, receiver } = req.params;

    const msgs = await Message.find({
      $or: [
        { senderId: sender, receiverId: receiver },
        { senderId: receiver, receiverId: sender }
      ]
    }).sort({ createdAt: 1 });

    res.json(msgs);
  } catch (err) {
    res.status(500).json({ error: true, message: err.message });
  }
});


// ====================================================
// ✅ SEND TEXT MESSAGE
// ====================================================
router.post("/messages/send", async (req, res) => {
  try {
    const { text, senderId, receiverId } = req.body;

    const msg = await Message.create({
      text,
      senderId,
      receiverId,
      createdAt: new Date()
    });

    res.json(msg);
  } catch (err) {
    res.status(500).json({ error: true, message: err.message });
  }
});


// ====================================================
// ✅ SEND FILE MESSAGE
// ====================================================
router.post("/messages/send-file", upload.single("file"), async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;
    const file = req.file;

    const msg = await Message.create({
      fileURL: `/uploads/${file.filename}`,
      fileName: file.originalname,
      senderId,
      receiverId,
      createdAt: new Date()
    });

    res.json(msg);
  } catch (err) {
    res.status(500).json({ error: true, message: err.message });
  }
});


module.exports = router;
