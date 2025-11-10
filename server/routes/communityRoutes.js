const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { protect } = require("../middleware/authMiddleware");

const {
  createPost,
  editPost,
  deletePost,
  toggleLike,
  addComment,
  editComment,
  deleteComment,
  getAllPosts,        // ✅ Added
  getSinglePost       // ✅ Added
} = require("../controllers/communityController");

// ====================================
// ✅ Multer Storage for Media Uploads
// ====================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads");
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// ====================================
// ✅ COMMUNITY ROUTES
// ====================================

// ✅ GET ALL POSTS  (required by CommunityFeed & ProfilePage)
router.get("/posts", getAllPosts);

// ✅ GET SINGLE POST (optional but included for completeness)
router.get("/post/:id", getSinglePost);

// ✅ CREATE POST
router.post("/post", protect, upload.single("media"), createPost);

// ✅ EDIT POST
router.put("/post/:id", protect, editPost);

// ✅ DELETE POST
router.delete("/post/:id", protect, deletePost);

// ✅ LIKE / UNLIKE POST
router.put("/post/:id/like", protect, toggleLike);

// ✅ ADD COMMENT
router.post("/post/:id/comment", protect, addComment);

// ✅ EDIT COMMENT
router.put("/post/:id/comment/:commentId", protect, editComment);

// ✅ DELETE COMMENT
router.delete("/post/:id/comment/:commentId", protect, deleteComment);

module.exports = router;
