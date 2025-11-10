// client/src/pages/CommunityChat.js
import React, { useEffect, useState, useRef } from "react";
import socket from "../utils/socket";
import axios from "../utils/axios";
import {
  FaPaperPlane,
  FaSmile,
  FaTrash,
  FaCheckDouble,
  FaImage,
  FaEdit,
} from "react-icons/fa";
import "../styles/CommunityChat.css";

export default function CommunityChat() {
  const myId = localStorage.getItem("userId");
  const myName = localStorage.getItem("userName") || "User";

  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [editMsgId, setEditMsgId] = useState(null);

  const bottomRef = useRef(null);
  const typingTimeout = useRef(null);

  // ✅ Auto scroll
  const scrollBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // ✅ Load chat history
  const loadMessages = async () => {
    try {
      const res = await axios.get("/api/community-chat/all");
      setMessages(res.data);
      scrollBottom();
    } catch (err) {
      console.error("LOAD ERROR:", err);
    }
  };

  // ✅ Send message (text + image + edit mode)
  const sendMessage = async (e) => {
    e.preventDefault();

    if (!msg.trim() && !imageFile) return;

    const form = new FormData();
    form.append("senderId", myId);
    form.append("senderName", myName);
    form.append("message", msg);

    if (imageFile) form.append("imageUrl", imageFile);

    let res;
    if (editMsgId) {
      // ✅ EDIT message
      res = await axios.put(`/api/community-chat/edit/${editMsgId}`, {
        message: msg,
      });

      socket.emit("chat:edit", res.data);

      setEditMsgId(null);
    } else {
      // ✅ NEW message
      res = await axios.post("/api/community-chat/send", form);
      socket.emit("chat:new", res.data);
    }

    setMsg("");
    setImageFile(null);
    scrollBottom();
  };

  // ✅ Delete
  const deleteMessage = async (id) => {
    await axios.delete(`/api/community-chat/${id}`);
    socket.emit("chat:delete", id);
  };

  // ✅ React
  const addReaction = (id, emoji) => {
    socket.emit("chat:reaction", {
      messageId: id,
      emoji,
      userId: myId,
    });
  };

  // ✅ Typing indicator
  const handleTyping = () => {
    socket.emit("chat:typing", myName);

    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit("chat:typing_stop", myName);
    }, 1200);
  };

  // ✅ Mark all as seen
  const seenMessages = () => {
    socket.emit("chat:seen", myId);
  };

  // ✅ Real-time listeners
  useEffect(() => {
    loadMessages();

    // ✅ Login socket
    socket.emit("setup", { _id: myId, name: myName });

    socket.on("presence:list", (list) => {
      setOnlineUsers(list);
    });

    socket.on("chat:new", (msg) => {
      setMessages((p) => [...p, msg]);
      scrollBottom();
      seenMessages();
    });

    socket.on("chat:delete", (id) => {
      setMessages((p) => p.filter((m) => m._id !== id));
    });

    socket.on("chat:edit", (updated) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === updated._id ? updated : m))
      );
    });

    socket.on("chat:reaction", ({ messageId, emoji, userId }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId
            ? {
                ...m,
                reactions: { ...(m.reactions || {}), [userId]: emoji },
              }
            : m
        )
      );
    });

    socket.on("chat:typing", (name) => {
      if (!typingUsers.includes(name)) {
        setTypingUsers((p) => [...p, name]);
      }
    });

    socket.on("chat:typing_stop", (name) => {
      setTypingUsers((p) => p.filter((n) => n !== name));
    });

    socket.on("chat:seen", (userId) => {
      setMessages((prev) =>
        prev.map((m) =>
          !m.seenBy?.includes(userId)
            ? { ...m, seenBy: [...(m.seenBy || []), userId] }
            : m
        )
      );
    });

    return () => {
      socket.off("chat:new");
      socket.off("chat:delete");
      socket.off("chat:edit");
      socket.off("chat:reaction");
      socket.off("chat:typing");
      socket.off("chat:typing_stop");
      socket.off("chat:seen");
    };
  }, []);

  return (
    <div className="chat-wrapper">

      {/* LEFT — Online Users */}
      <div className="left-panel">
        <h3>Online Users</h3>
        {onlineUsers.map((u) => (
          <div key={u.socketId} className="online-user">
            <span className="dot"></span> {u.name}
          </div>
        ))}
      </div>

      {/* CENTER — Chat Section */}
      <div className="chat-box">

        <div className="chat-header">Community Chat</div>

        <div className="messages">
          {messages.map((m) => (
            <div
              key={m._id}
              className={`bubble ${m.senderId === myId ? "me" : "other"}`}
            >
              <div className="sender">{m.senderName}</div>

              {m.message && <div className="text">{m.message}</div>}

              {m.imageUrl && (
                <img src={m.imageUrl} className="chat-img" alt="" />
              )}

              {/* REACTIONS */}
              <div className="react-bar">
                {["❤️", "😂", "👍", "🔥", "😮"].map((e) => (
                  <span key={e} onClick={() => addReaction(m._id, e)}>
                    {e}
                  </span>
                ))}
              </div>

              {/* SHOW REACTIONS */}
              <div className="react-show">
                {m.reactions &&
                  Object.values(m.reactions).map((e, i) => <span key={i}>{e}</span>)}
              </div>

              {/* SEEN */}
              {m.seenBy?.length > 0 && (
                <div className="seen">
                  <FaCheckDouble />
                  {m.seenBy.length} seen
                </div>
              )}

              {/* EDIT / DELETE */}
              {m.senderId === myId && (
                <div className="edit-delete">
                  <FaEdit onClick={() => setEditMsgId(m._id) || setMsg(m.message)} />
                  <FaTrash onClick={() => deleteMessage(m._id)} />
                </div>
              )}
            </div>
          ))}

          {/* TYPING */}
          {typingUsers.length > 0 && (
            <div className="typing">{typingUsers.join(", ")} typing...</div>
          )}

          <div ref={bottomRef}></div>
        </div>

        {/* INPUT BOX */}
        <form className="input-box" onSubmit={sendMessage}>
          <label className="img-btn">
            <FaImage />
            <input
              type="file"
              hidden
              onChange={(e) => setImageFile(e.target.files[0])}
            />
          </label>

          <input
            value={msg}
            onChange={(e) => {
              setMsg(e.target.value);
              handleTyping();
            }}
            placeholder={editMsgId ? "Editing..." : "Type a message..."}
          />

          <button type="submit">
            <FaPaperPlane />
          </button>
        </form>
      </div>
    </div>
  );
}
