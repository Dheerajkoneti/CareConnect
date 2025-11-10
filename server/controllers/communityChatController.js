const Chat = require("../models/CommunityChatMessage");

// ✅ Load all messages (returns array only)
exports.getAllMessages = async (req, res) => {
  try {
    const msgs = await Chat.find().sort({ createdAt: 1 });
    res.json(msgs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Send message (text + image)
exports.sendMessage = async (req, res) => {
  try {
    let { senderId, senderName, message, imageUrl } = req.body;

    // ✅ Required fields check
    if (!senderId || !senderName) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // ✅ Fix blob URLs (prevent MongoDB crash)
    if (imageUrl && imageUrl.startsWith("blob:")) {
      imageUrl = null;
    }

    // ✅ multer uploaded file
    const uploadedImage = req.file ? `/uploads/${req.file.filename}` : imageUrl || null;

    const newMsg = await Chat.create({
      senderId,
      senderName,
      message,
      imageUrl: uploadedImage,
    });

    res.json(newMsg);
  } catch (err) {
    console.error("SEND ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ Delete message
exports.deleteMessage = async (req, res) => {
  try {
    await Chat.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
