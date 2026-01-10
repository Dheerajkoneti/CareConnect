import React, { useEffect, useState } from "react";
import api from "../utils/axiosInstance";
import io from "socket.io-client";
import { useRef } from "react";
const API = "/api/community";

const ProfilePage = () => {
  const socketRef = useRef(null);
  const [user, setUser] = useState(null);
  const [myPosts, setMyPosts] = useState([]);
  const [requests, setRequests] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ fullName: "", bio: "" });
  const [profilePreview, setProfilePreview] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editText, setEditText] = useState("");
  const [activePost, setActivePost] = useState(null);

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  // ===================================================
  // ✅ Load Profile + Posts + Requests
  // ===================================================
  useEffect(() => {
    if (!socketRef.current) {
        socketRef.current = io(process.env.REACT_APP_API_URL, {
        transports: ["websocket"],
      });
    }
    const socket = socketRef.current;
    const loadData = async () => {
      const headers = { Authorization: `Bearer ${token}` };

      // ✅ Load User
      const userRes = await api.get(
        `/api/users/${userId}`,
        { headers }
      );
      setUser(userRes.data);
      setFormData({
        fullName: userRes.data.fullName,
        bio: userRes.data.bio || "",
      });

      // ✅ Load Posts
      const postsRes = await api.get(`${API}/posts`);
      setMyPosts(postsRes.data.filter((p) => p.authorId === userId));

      // ✅ Load Requests
      const reqRes = await api.get(
        `/api/users/${userId}/requests`,
        { headers }
      );
      setRequests(reqRes.data);
    };

    loadData();

    // ✅ Socket Updates
    socket.on("post:new", (post) => {
      if (post.authorId === userId) {
        setMyPosts((prev) => [post, ...prev]);
      }
    });

    socket.on("post:delete", (postId) => {
      setMyPosts((prev) => prev.filter((p) => p._id !== postId));
    });

    socket.on("post:edit", (post) => {
      if (post.authorId === userId)
        setMyPosts((prev) =>
          prev.map((p) => (p._id === post._id ? post : p))
        );
    });

    return () => {
      socketRef.current?.off("post:new");
      socketRef.current?.off("post:delete");
      socketRef.current?.off("post:edit");
    };
  }, [userId, token]);
  // ===================================================
  // ✅ Edit Profile Functions
  // ===================================================
  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) setProfilePreview(URL.createObjectURL(file));
    setFormData({ ...formData, profilePic: file });
  };

  const handleSaveProfile = async () => {
    const form = new FormData();
    form.append("fullName", formData.fullName);
    form.append("bio", formData.bio);

    if (formData.profilePic) form.append("profilePic", formData.profilePic);
    const res = await api.put(
      "/api/users/update-profile",
      form,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    setUser(res.data.user);
    setProfilePreview(null);
    setIsEditing(false);
  };

  // ===================================================
  // ✅ Edit Post
  // ===================================================
  const openEdit = (post) => {
    setActivePost(post);
    setEditText(post.content);
    setEditMode(true);
  };

  const saveEdit = async () => {
    const res = await api.put(
      `${API}/post/${activePost._id}`,
      { userId, content: editText }
    );
    socket.emit("post:edit", res.data.post);
    setEditMode(false);
  };

  // ===================================================
  // ✅ Delete Post
  // ===================================================
  const deletePost = async (postId) => {
    if (!window.confirm("Delete this post?")) return;

    await api.delete(`${API}/post/${postId}`, {
      data: { userId },
    });
    socket.emit("post:delete", postId);
  };
  if (!user) return <p>Loading...</p>;
  return (
    <div style={styles.page}>
      {/* ✅ PROFILE HEADER CARD */}
      <div style={styles.profileCard}>
        <div style={styles.avatarWrapper}>
          <img
            src={
              profilePreview
                ? profilePreview
                : user.profilePic
                ? `${process.env.REACT_APP_API_URL}${user.profilePic}`
                : "/default-profile.png"
            }
            style={styles.avatar}
            alt="Profile"
          />

          {isEditing && (
            <label style={styles.uploadIcon}>
              📷
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePicChange}
                style={{ display: "none" }}
              />
            </label>
          )}
        </div>

        {/* ✅ Profile Info */}
        <h2 style={styles.name}>{user.fullName}</h2>
        <p style={styles.email}>{user.email}</p>
        <p style={styles.role}>{user.role}</p>

        {isEditing ? (
          <div style={styles.editBox}>
            <input
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              style={styles.input}
            />

            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              style={styles.textarea}
            />

            <button style={styles.saveBtn} onClick={handleSaveProfile}>
              Save
            </button>
            <button style={styles.cancelBtn} onClick={() => setIsEditing(false)}>
              Cancel
            </button>
          </div>
        ) : (
          <>
            <p style={styles.bio}>{user.bio}</p>

            <button style={styles.editBtn} onClick={() => setIsEditing(true)}>
              Edit Profile
            </button>
          </>
        )}

        {/* ✅ Stats Row */}
        <div style={styles.statsRow}>
          <div style={styles.stat}>
            <strong>{myPosts.length}</strong>
            <span>Posts</span>
          </div>

          <div style={styles.stat}>
            <strong>{requests.length}</strong>
            <span>Requests</span>
          </div>
        </div>
      </div>

      {/* ✅ SECTION TITLE */}
      <h3 style={styles.sectionTitle}>My Posts</h3>

      {/* ✅ POSTS GRID */}
      <div style={styles.grid}>
        {myPosts.length === 0 ? (
          <p style={styles.noPosts}>You have no posts yet.</p>
        ) : (
          myPosts.map((post) => (
            <div key={post._id} style={styles.postCard}>
              <p style={styles.postText}>{post.content}</p>

              {post.mediaUrl && (
                post.mediaType === "image" ? (
                  <img
                    src={`${process.env.REACT_APP_API_URL}${post.mediaUrl}`}
                    alt=""
                    style={styles.postMedia}
                  />
                ) : (
                  <video
                    controls
                    src={`${process.env.REACT_APP_API_URL}${post.mediaUrl}`}
                    style={styles.postMedia}
                  />
                )
              )}

              <div style={styles.actions}>
                <button style={styles.editSmallBtn} onClick={() => openEdit(post)}>
                  ✏ Edit
                </button>

                <button
                  style={styles.deleteSmallBtn}
                  onClick={() => deletePost(post._id)}
                >
                  🗑 Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ✅ Edit Modal */}
      {editMode && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3>Edit Post</h3>
            <textarea
              style={styles.textarea}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
            />
            <button style={styles.saveBtn} onClick={saveEdit}>Save</button>
            <button style={styles.cancelBtn} onClick={() => setEditMode(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ✅ Modern Instagram-Style CSS (inline styles) */
const styles = {
  page: {
    padding: "20px",
    minHeight: "100vh",
    background: "#fafafa",
    fontFamily: "Poppins, sans-serif",
  },

  // PROFILE CARD
  profileCard: {
    background: "#fff",
    borderRadius: 20,
    padding: 30,
    textAlign: "center",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    maxWidth: 500,
    margin: "0 auto 30px",
  },

  avatarWrapper: { position: "relative", width: 140, margin: "0 auto" },

  avatar: {
    width: 140,
    height: 140,
    objectFit: "cover",
    borderRadius: "50%",
    border: "4px solid white",
    boxShadow: "0 0 10px rgba(0,0,0,0.2)",
  },

  uploadIcon: {
    position: "absolute",
    bottom: 5,
    right: 0,
    background: "#fff",
    padding: "5px 10px",
    borderRadius: 20,
    fontSize: 20,
    cursor: "pointer",
    boxShadow: "0 0 6px rgba(0,0,0,0.2)",
  },

  name: { marginTop: 15, fontSize: 25, fontWeight: "700" },
  email: { color: "#666" },
  role: { color: "#9b59b6", fontWeight: "600" },
  bio: { marginTop: 10, color: "#444" },

  editBtn: {
    marginTop: 12,
    background: "#6c5ce7",
    color: "#fff",
    padding: "8px 20px",
    borderRadius: 10,
    border: "none",
    cursor: "pointer",
  },

  editBox: { marginTop: 20 },

  input: {
    width: "100%",
    padding: 10,
    borderRadius: 10,
    border: "1px solid #ddd",
    marginBottom: 10,
  },

  textarea: {
    width: "100%",
    padding: 10,
    borderRadius: 10,
    border: "1px solid #ddd",
    height: 100,
    marginBottom: 10,
  },

  saveBtn: {
    width: "100%",
    padding: 12,
    background: "#2ecc71",
    color: "#fff",
    borderRadius: 12,
    border: "none",
    marginBottom: 10,
    cursor: "pointer",
  },
  cancelBtn: {
    width: "100%",
    padding: 12,
    background: "#e74c3c",
    color: "#fff",
    borderRadius: 12,
    border: "none",
    cursor: "pointer",
  },

  statsRow: {
    marginTop: 20,
    display: "flex",
    justifyContent: "space-around",
  },

  stat: { textAlign: "center" },

  // POSTS GRID
  sectionTitle: {
    fontSize: 22,
    fontWeight: "600",
    margin: "25px 0 10px 0",
    textAlign: "center",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
    gap: 15,
    maxWidth: 600,
    margin: "0 auto",
  },

  postCard: {
    background: "#fff",
    borderRadius: 12,
    padding: 10,
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  },

  postText: { marginBottom: 10, color: "#555" },

  postMedia: {
    width: "100%",
    borderRadius: 10,
    marginBottom: 10,
  },

  actions: {
    display: "flex",
    justifyContent: "space-between",
  },

  editSmallBtn: {
    background: "#6c5ce7",
    color: "#fff",
    padding: "5px 10px",
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
    fontSize: 12,
  },

  deleteSmallBtn: {
    background: "#e74c3c",
    color: "#fff",
    padding: "5px 10px",
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
    fontSize: 12,
  },

  noPosts: { textAlign: "center", color: "#777" },

  // MODAL
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  modal: {
    background: "#fff",
    padding: 20,
    borderRadius: 15,
    width: "90%",
    maxWidth: 400,
  },
};

export default ProfilePage;
