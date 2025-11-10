// server/routes/communityFeedRoutes.js

const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const {
  createPost,
  editPost,
  deletePost,
  toggleLike,
  addComment,
  editComment,
  deleteComment,
} = require("../controllers/communityController");

// ======================================================
// ✅ Multer setup for image/video storage
// ======================================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

/* =======================================================
   ✅ COMMUNITY FEED ROUTES
   ======================================================= */

// ✅ Create post (with optional image/video)
router.post("/upload", upload.single("image"), createPost);

// ✅ Edit post (with optional new media)
router.put("/edit/:id", upload.single("image"), editPost);

// ✅ Delete post
router.delete("/delete/:id", deletePost);

// ✅ Like/unlike post
router.post("/like/:id", toggleLike);

// ✅ Add comment
router.post("/comment/:id", addComment);

// ✅ Edit comment
router.put("/comment/:id/:commentId", editComment);

// ✅ Delete comment
router.delete("/comment/:id/:commentId", deleteComment);

module.exports = router;
