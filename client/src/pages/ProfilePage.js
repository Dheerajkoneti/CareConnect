import React, { useEffect, useState } from "react";
import axios from "axios";
import io from "socket.io-client";

const socket = io("http://localhost:5000");
const API = "http://localhost:5000/api/community";

const ProfilePage = () => {
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
  // ✅ Load Profile + My Posts
  // ===================================================
  useEffect(() => {
    const loadData = async () => {
      const headers = { Authorization: `Bearer ${token}` };

      const userRes = await axios.get(
        `http://localhost:5000/api/users/${userId}`,
        { headers }
      );

      setUser(userRes.data);
      setFormData({
        fullName: userRes.data.fullName,
        bio: userRes.data.bio || "",
      });

      const postsRes = await axios.get(`${API}/posts`);
      setMyPosts(postsRes.data.filter((p) => p.authorId === userId));

      const reqRes = await axios.get(
        `http://localhost:5000/api/users/${userId}/requests`,
        { headers }
      );
      setRequests(reqRes.data);
    };

    loadData();

    // ===================================================
    // ✅ Socket Listeners
    // ===================================================
    socket.on("post:new", (post) => {
      if (post.authorId === userId)
        setMyPosts((prev) => [post, ...prev]);
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

    return () => socket.disconnect();
  }, [userId, token]);

  // ===================================================
  // ✅ Edit Profile
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

    const res = await axios.put(
      "http://localhost:5000/api/users/update-profile",
      form,
      {
        headers: {
          Authorization: `Bearer ${token}`,
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
    const res = await axios.put(
      `${API}/post/${activePost._id}`,
      { userId, content: editText },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    socket.emit("post:edit", res.data.post);
    setEditMode(false);
  };

  // ===================================================
  // ✅ Delete Post
  // ===================================================
  const deletePost = async (postId) => {
    if (!window.confirm("Delete this post?")) return;

    await axios.delete(`${API}/post/${postId}`, {
      data: { userId },
      headers: { Authorization: `Bearer ${token}` },
    });

    socket.emit("post:delete", postId);
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div style={styles.pageContainer}>
      {/* PROFILE SECTION */}
      <div style={styles.profileCard}>
        <div style={styles.profileTop}>
          <div style={styles.profileImageWrapper}>
            <img
              src={
                profilePreview
                  ? profilePreview
                  : user.profilePic
                  ? `http://localhost:5000${user.profilePic}`
                  : "/default-profile.png"
              }
              alt="Profile"
              style={styles.profileImage}
            />

            {isEditing && (
              <label style={styles.uploadLabel}>
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

          <div style={styles.profileInfo}>
            {isEditing ? (
              <>
                <input
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  style={styles.editInput}
                />
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  style={styles.editTextarea}
                />

                <button style={styles.saveButton} onClick={handleSaveProfile}>
                  Save
                </button>
                <button
                  style={styles.cancelButton}
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <h2 style={styles.userName}>{user.fullName}</h2>
                <p style={styles.userEmail}>{user.email}</p>
                <p style={styles.userRole}>{user.role}</p>
                <p style={styles.userBio}>{user.bio}</p>

                <button
                  style={styles.editButton}
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </button>
              </>
            )}

            <div style={styles.statsRow}>
              <div style={styles.statBox}>
                <strong>{myPosts.length}</strong>
                <span>Posts</span>
              </div>
              <div style={styles.statBox}>
                <strong>{requests.length}</strong>
                <span>Requests</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MY POSTS GRID */}
      <h3 style={styles.sectionTitle}>My Posts</h3>

      <div style={styles.postsGrid}>
        {myPosts.length === 0 ? (
          <p style={styles.noPosts}>You have no posts yet.</p>
        ) : (
          myPosts.map((post) => (
            <div key={post._id} style={styles.postCard}>
              <p style={styles.postContent}>{post.content}</p>

              {post.mediaUrl && (
                <>
                  {post.mediaType === "image" ? (
                    <img
                      src={`http://localhost:5000${post.mediaUrl}`}
                      style={styles.postImage}
                      alt=""
                    />
                  ) : (
                    <video
                      controls
                      src={`http://localhost:5000${post.mediaUrl}`}
                      style={styles.postImage}
                    />
                  )}
                </>
              )}

              <div style={styles.postActions}>
                <button
                  style={styles.actionBtn}
                  onClick={() => openEdit(post)}
                >
                  ✏ Edit
                </button>

                <button
                  style={styles.actionBtnDelete}
                  onClick={() => deletePost(post._id)}
                >
                  🗑 Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* EDIT POST MODAL */}
      {editMode && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3>Edit Post</h3>

            <textarea
              style={styles.editTextarea}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
            />

            <button style={styles.saveButton} onClick={saveEdit}>
              Save
            </button>

            <button
              style={styles.cancelButton}
              onClick={() => setEditMode(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ✅ STYLES (Trimmed for clarity; your full style block remains unchanged) */
const styles = {
  pageContainer: {
    fontFamily: "Poppins, sans-serif",
    padding: "40px",
  },
  profileCard: {
    background: "white",
    padding: "30px",
    borderRadius: "20px",
  },
  // ... KEEP ALL YOUR EXISTING STYLE CODE ...
};

export default ProfilePage;
