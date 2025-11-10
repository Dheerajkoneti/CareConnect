const CommunityPost = require("../models/CommunityPost");
const mongoose = require("mongoose");

// ================================
// ✅ SAFE HELPER: Validate ObjectId
// ================================
function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// ================================
// ✅ GET ALL POSTS
// ================================
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await CommunityPost.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: "Failed to load posts" });
  }
};

// ================================
// ✅ GET SINGLE POST
// ================================
exports.getSinglePost = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id))
      return res.status(400).json({ error: "Invalid post ID" });

    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    res.json(post);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch post" });
  }
};

// ================================
// ✅ CREATE POST
// ================================
exports.createPost = async (req, res) => {
  try {
    const { authorId, authorName, content } = req.body;

    if (!isValidObjectId(authorId))
      return res.status(400).json({ error: "Invalid authorId" });

    if (!content && !req.file)
      return res.status(400).json({ error: "Content or media required" });

    let mediaUrl = null;
    let mediaType = null;

    if (req.file) {
      mediaUrl = "/uploads/" + req.file.filename;
      mediaType = req.file.mimetype.startsWith("video") ? "video" : "image";
    }

    const post = await CommunityPost.create({
      authorId,
      authorName,
      content,
      mediaUrl,
      mediaType,
      likes: [],
      comments: [],
    });

    res.status(201).json({ post });
  } catch (err) {
    console.error("❌ CREATE POST ERROR:", err);
    res.status(500).json({ error: "Failed to create post" });
  }
};

// ================================
// ✅ EDIT POST
// ================================
exports.editPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const { userId, content } = req.body;

    if (!isValidObjectId(postId))
      return res.status(400).json({ error: "Invalid post ID" });

    const post = await CommunityPost.findById(postId);
    if (!post) return res.status(404).json({ error: "Post not found" });

    if (post.authorId.toString() !== userId)
      return res.status(403).json({ error: "You cannot edit this post" });

    post.content = content;
    post.edited = true;
    await post.save();

    res.json({ post });
  } catch (err) {
    res.status(500).json({ error: "Failed to edit post" });
  }
};

// ================================
// ✅ DELETE POST
// ================================
exports.deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const { userId } = req.body;

    if (!isValidObjectId(postId))
      return res.status(400).json({ error: "Invalid post ID" });

    const post = await CommunityPost.findById(postId);
    if (!post) return res.status(404).json({ error: "Post not found" });

    if (post.authorId.toString() !== userId)
      return res.status(403).json({ error: "You cannot delete this post" });

    await post.deleteOne();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete post" });
  }
};

// ================================
// ✅ LIKE / UNLIKE
// ================================
exports.toggleLike = async (req, res) => {
  try {
    const postId = req.params.id;
    const { userId } = req.body;

    if (!isValidObjectId(postId))
      return res.status(400).json({ error: "Invalid post ID" });

    if (!isValidObjectId(userId))
      return res.status(400).json({ error: "Invalid userId" });

    const post = await CommunityPost.findById(postId);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const alreadyLiked = post.likes.includes(userId);

    if (alreadyLiked) {
      post.likes = post.likes.filter((id) => id !== userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();

    res.json({ post });
  } catch (err) {
    console.error("❌ Like Error:", err);
    res.status(500).json({ error: "Failed to toggle like" });
  }
};

// ================================
// ✅ ADD COMMENT
// ================================
exports.addComment = async (req, res) => {
  try {
    const postId = req.params.id;
    const { userId, userName, text } = req.body;

    if (!isValidObjectId(postId))
      return res.status(400).json({ error: "Invalid post ID" });

    const post = await CommunityPost.findById(postId);
    if (!post) return res.status(404).json({ error: "Post not found" });

    post.comments.push({
      userId,
      userName,
      text,
      createdAt: new Date(),
    });

    await post.save();

    res.json({ post });
  } catch (err) {
    res.status(500).json({ error: "Failed to add comment" });
  }
};

// ================================
// ✅ EDIT COMMENT
// ================================
exports.editComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const { userId, text } = req.body;

    if (!isValidObjectId(id) || !isValidObjectId(commentId))
      return res.status(400).json({ error: "Invalid ID" });

    const post = await CommunityPost.findById(id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    if (comment.userId !== userId)
      return res.status(403).json({ error: "Not your comment" });

    comment.text = text;
    comment.edited = true;

    await post.save();

    res.json({ post });
  } catch (err) {
    res.status(500).json({ error: "Failed to edit comment" });
  }
};

// ================================
// ✅ DELETE COMMENT
// ================================
exports.deleteComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const { userId } = req.body;

    if (!isValidObjectId(id) || !isValidObjectId(commentId))
      return res.status(400).json({ error: "Invalid ID" });

    const post = await CommunityPost.findById(id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    if (comment.userId !== userId)
      return res.status(403).json({ error: "Not your comment" });

    comment.deleteOne();
    await post.save();

    res.json({ post });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete comment" });
  }
};
