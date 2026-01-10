// client/src/pages/ActiveChatPage.js
import React, { useEffect, useRef, useState } from "react";
import "../styles/ActiveChatPage.css";
import api from "../utils/axiosInstance";
import socket from "../utils/socket";

// ✅ Avatar Color Generator
function generateAvatarColor(str = "U") {
  const colors = ["#4f46e5", "#10b981", "#ef4444", "#f59e0b", "#3b82f6", "#8b5cf6"];
  let sum = 0;
  for (let i = 0; i < str.length; i++) sum += str.charCodeAt(i);
  return colors[sum % colors.length];
}

export default function ActiveChatPage() {
  const [users, setUsers] = useState([]);
  const [activeChatUser, setActiveChatUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState("");
  const [search, setSearch] = useState("");
  const myId = localStorage.getItem("userId");
  const endRef = useRef();

  // ✅ Fetch Users
  useEffect(() => {
    api
      .get("/api/users/all")
      .then((res) => setUsers(res.data))
      .catch(console.error);
  }, []);

  // ✅ Load Chat Messages
  useEffect(() => {
    if (!activeChatUser) return;

    api
      .get(`/api/messages/${myId}/${activeChatUser._id}`)
      .then((res) => setMessages(res.data))
      .catch(console.error);

    socket.emit("join-room", {
      sender: myId,
      receiver: activeChatUser._id,
    });

    const handleReceive = (data) => {
      if (data.senderId === activeChatUser._id) {
        setMessages((prev) => [...prev, data]);
      }
    };

    socket.on("receive-message", handleReceive);

    return () => socket.off("receive-message", handleReceive);
  }, [activeChatUser, myId]);

  // ✅ Auto scroll
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ Send Message
  const sendMessage = async () => {
    if (!msg.trim()) return;

    const data = {
      text: msg,
      senderId: myId,
      receiverId: activeChatUser._id,
    };

    socket.emit("send-message", data);
    setMessages((prev) => [...prev, data]);
    setMsg("");

    await api.post("/api/messages/send", data);
  };

  // ✅ Send File
  const sendFile = async (file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("senderId", myId);
    formData.append("receiverId", activeChatUser._id);

    const res = await api.post("/api/messages/send-file", formData);

    socket.emit("send-message", res.data);
    setMessages((prev) => [...prev, res.data]);
  };

  return (
    <div className="activechat-wrapper">
      {/* LEFT USER LIST */}
      <div className="user-list">
        <div className="header">
          <input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="user-scroll">
          {users
            .filter((u) =>
              (u.name || u.email)
                .toLowerCase()
                .includes(search.toLowerCase())
            )
            .map((u) => (
              <div
                key={u._id}
                className={`user-item ${
                  activeChatUser?._id === u._id ? "active" : ""
                }`}
                onClick={() => setActiveChatUser(u)}
              >
                <div
                  className="avatar-circle"
                  style={{ background: generateAvatarColor(u.name || u.email) }}
                >
                  {(u.name || u.email)[0].toUpperCase()}
                </div>

                <div className="meta">
                  <div className="name">{u.name || "User"}</div>
                  <div className="preview">{u.email}</div>
                </div>

                <div className="call-buttons">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = `/call?user=${u._id}`;
                    }}
                  >
                    📞
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = `/video-call?user=${u._id}`;
                    }}
                  >
                    🎥
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* RIGHT CHAT */}
      <div className="chat-window">
        {!activeChatUser ? (
          <div className="empty-chat">Select a user to start chat</div>
        ) : (
          <>
            <div className="chat-header">
              <div
                className="avatar-circle header-avatar"
                style={{
                  background: generateAvatarColor(activeChatUser.name || "U"),
                }}
              >
                {(activeChatUser.name || "U")[0].toUpperCase()}
              </div>

              <div className="header-meta">
                <div className="name">{activeChatUser.name}</div>
                <div className="status">
                  Last seen: {new Date().toLocaleTimeString()}
                </div>
              </div>
            </div>

            <div className="chat-body">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`message ${
                    m.senderId === myId ? "me" : "other"
                  }`}
                >
                  {m.text && <p>{m.text}</p>}

                  {m.fileURL && (
                    <a href={m.fileURL} target="_blank" rel="noreferrer">
                      📎 {m.fileName}
                    </a>
                  )}
                </div>
              ))}
              <div ref={endRef} />
            </div>

            <div className="chat-input">
              <label className="file-btn">
                📎
                <input
                  type="file"
                  hidden
                  onChange={(e) => sendFile(e.target.files[0])}
                />
              </label>

              <input
                placeholder="Type a message..."
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
              />

              <button onClick={sendMessage}>➤</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}