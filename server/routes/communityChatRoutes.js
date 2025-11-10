const express = require("express");
const router = express.Router();
const multer = require("multer");
const chatCtrl = require("../controllers/communityChatController");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

router.get("/all", chatCtrl.getAllMessages);
router.post("/send", upload.single("imageUrl"), chatCtrl.sendMessage);
router.delete("/:id", chatCtrl.deleteMessage);

module.exports = router;
