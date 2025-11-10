import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

// ✅ Correct Community API base
const API = "http://localhost:5000/api/community";

function CommunityFeed() {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const userName = localStorage.getItem("userName");

  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState("");
  const [media, setMedia] = useState(null);

  // Modals
  const [showComments, setShowComments] = useState(false);
  const [activePost, setActivePost] = useState(null);
  const [commentText, setCommentText] = useState("");

  const [editMode, setEditMode] = useState(false);
  const [editText, setEditText] = useState("");

  // ✅ Load all posts
  const loadPosts = async () => {
    try {
      const res = await axios.get(`${API}/posts`);
      setPosts(res.data);
    } catch (err) {
      console.error("❌ Failed to load posts:", err);
    }
  };

  useEffect(() => {
    loadPosts();

    // ✅ SOCKET LISTENERS
    socket.on("post:new", (post) => setPosts((prev) => [post, ...prev]));

    socket.on("post:edit", (post) =>
      setPosts((prev) => prev.map((p) => (p._id === post._id ? post : p)))
    );

    socket.on("post:delete", (id) =>
      setPosts((prev) => prev.filter((p) => p._id !== id))
    );

    socket.on("post:like", ({ postId, likes }) =>
      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? { ...p, likes } : p))
      )
    );

    socket.on("post:comment:new", ({ post }) =>
      setPosts((prev) => prev.map((p) => (p._id === post._id ? post : p)))
    );

    socket.on("post:comment:edit", ({ post }) =>
      setPosts((prev) => prev.map((p) => (p._id === post._id ? post : p)))
    );

    socket.on("post:comment:delete", ({ post }) =>
      setPosts((prev) => prev.map((p) => (p._id === post._id ? post : p)))
    );

    return () => socket.disconnect();
  }, []);

  // ✅ Create Post
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim() && !media) {
      alert("Write something or add media.");
      return;
    }

    try {
      const form = new FormData();
      form.append("authorId", userId);
      form.append("authorName", userName);
      form.append("content", content);
      if (media) form.append("media", media);

      const res = await axios.post(`${API}/post`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });

      socket.emit("post:new", res.data.post);

      setContent("");
      setMedia(null);
    } catch (err) {
      console.error("❌ Create post error:", err);
    }
  };

  // ✅ Like / Unlike
  const toggleLike = async (postId) => {
    try {
      const res = await axios.put(
        `${API}/post/${postId}/like`,
        { userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      socket.emit("post:like", {
        postId,
        likes: res.data.post.likes,
      });
    } catch (err) {
      console.error("❌ Like error:", err);
    }
  };

  // ✅ Comments Modal
  const openComments = (post) => {
    setActivePost(post);
    setCommentText("");
    setShowComments(true);
  };

  // ✅ Add Comment
  const addComment = async () => {
    try {
      const res = await axios.post(
        `${API}/post/${activePost._id}/comment`,
        { userId, userName, text: commentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      socket.emit("post:comment:new", { post: res.data.post });
      setActivePost(res.data.post);
      setCommentText("");
    } catch (err) {
      console.error("❌ Comment error:", err);
    }
  };

  // ✅ DELETE POST
  const deletePost = async (id) => {
    if (!window.confirm("Delete this post?")) return;

    try {
      await axios.delete(`${API}/post/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { userId },
      });

      socket.emit("post:delete", id);
    } catch (err) {
      console.error("❌ Delete error:", err);
    }
  };

  // ✅ EDIT POST
  const openEdit = (post) => {
    setActivePost(post);
    setEditText(post.content);
    setEditMode(true);
  };

  const saveEdit = async () => {
    try {
      const res = await axios.put(
        `${API}/post/${activePost._id}`,
        { userId, content: editText },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      socket.emit("post:edit", res.data.post);
      setEditMode(false);
    } catch (err) {
      console.error("❌ Edit error:", err);
    }
  };

  return (
    <div style={styles.page}>
      <Sidebar />

      <div style={styles.container}>
        <h2 style={styles.title}>Community Feed</h2>

        {/* ✅ Create Post */}
        <form onSubmit={handleSubmit} style={styles.postForm}>
          <textarea
            style={styles.textarea}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share something with the community…"
          />
          <input
            type="file"
            accept="image/*,video/*"
            onChange={(e) => setMedia(e.target.files[0])}
          />
          <button style={styles.button}>Post</button>
        </form>

        {/* ✅ Posts Grid */}
        <div style={styles.grid}>
          {posts.map((p) => (
            <div key={p._id} style={styles.card}>
              <div style={styles.cardHeader}>
                <strong>{p.authorName}</strong>

                {p.authorId === userId && (
                  <div>
                    <button style={styles.smallBtn} onClick={() => openEdit(p)}>
                      ✏
                    </button>
                    <button
                      style={styles.smallBtn}
                      onClick={() => deletePost(p._id)}
                    >
                      🗑
                    </button>
                  </div>
                )}
              </div>

              <p>{p.content}</p>

              {p.mediaUrl && (
                <>
                  {p.mediaType === "image" ? (
                    <img
                      src={`http://localhost:5000${p.mediaUrl}`}
                      alt="media"
                      style={styles.postMedia}
                    />
                  ) : (
                    <video
                      controls
                      src={`http://localhost:5000${p.mediaUrl}`}
                      style={styles.postMedia}
                    />
                  )}
                </>
              )}

              <div style={styles.actions}>
                <button onClick={() => toggleLike(p._id)}>
                  ❤️ {p.likes.length}
                </button>
                <button onClick={() => openComments(p)}>
                  💬 {p.comments.length}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ✅ COMMENT MODAL */}
      {showComments && activePost && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3>Comments</h3>

            <div style={styles.commentList}>
              {activePost.comments.map((c) => (
                <div key={c._id} style={styles.commentBox}>
                  <strong>{c.userName}: </strong> {c.text}
                </div>
              ))}
            </div>

            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              style={styles.commentInput}
            />

            <button onClick={addComment} style={styles.button}>
              Add Comment
            </button>

            <button
              onClick={() => setShowComments(false)}
              style={styles.closeBtn}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ✅ EDIT POST MODAL */}
      {editMode && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3>Edit Post</h3>

            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              style={styles.commentInput}
            />

            <button onClick={saveEdit} style={styles.button}>
              Save
            </button>

            <button
              onClick={() => setEditMode(false)}
              style={styles.closeBtn}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { display: "flex" },
  container: { flex: 1, padding: "20px" },
  title: { fontSize: "26px", marginBottom: "20px" },
  postForm: {
    background: "white",
    padding: "15px",
    borderRadius: "10px",
    marginBottom: "20px",
  },
  textarea: { width: "100%", minHeight: "60px", marginBottom: "10px" },
  button: {
    padding: "8px 14px",
    background: "#6A1B9A",
    color: "white",
    border: "none",
    borderRadius: "5px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: "15px",
  },
  card: {
    background: "white",
    padding: "10px",
    borderRadius: "10px",
    boxShadow: "0 1px 5px rgba(0,0,0,0.1)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "8px",
  },
  postMedia: {
    width: "100%",
    borderRadius: "10px",
    marginTop: "10px",
  },
  actions: {
    marginTop: "10px",
    display: "flex",
    justifyContent: "space-between",
  },
  smallBtn: {
    marginLeft: "6px",
    background: "none",
    border: "none",
    cursor: "pointer",
  },

  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    background: "white",
    padding: "20px",
    borderRadius: "10px",
    width: "400px",
  },
  commentList: {
    maxHeight: "200px",
    overflowY: "auto",
    marginBottom: "10px",
  },
  commentBox: {
    background: "#f2f2f2",
    padding: "8px",
    borderRadius: "6px",
    marginBottom: "6px",
  },
  commentInput: {
    width: "100%",
    minHeight: "60px",
    marginBottom: "10px",
  },
  closeBtn: {
    marginTop: "10px",
    background: "#aaa",
    color: "white",
    padding: "8px 12px",
    borderRadius: "5px",
    border: "none",
  },
};

export default CommunityFeed;
