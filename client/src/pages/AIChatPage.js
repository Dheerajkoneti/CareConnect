// client/src/pages/AIChatPage.js — FINAL WORKING VERSION ✅

import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import EmojiPicker from "emoji-picker-react";
import { BsPaperclip, BsMicFill, BsEmojiSmile } from "react-icons/bs";

function AIChatPage() {
    const navigate = useNavigate();

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [showEmoji, setShowEmoji] = useState(false);
    const [typing, setTyping] = useState(false);

    const chatEndRef = useRef(null);

    // ✅ Login Protection
    useEffect(() => {
        if (!localStorage.getItem("token")) {
            alert("Session expired. Please login again.");
            navigate("/login");
        }
    }, [navigate]);

    // ✅ Auto-scroll
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, typing]);

    // ✅ Emoji Insert
    const handleEmojiClick = (emoji) => {
        setInput((prev) => prev + emoji.emoji);
        setShowEmoji(false);
    };

    // ✅ Placeholder for file upload
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) alert(`📁 Selected: ${file.name}`);
    };

    // ✅ Placeholder for voice input
    const handleVoiceInput = () => {
        const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            alert("❌ Voice recognition not supported in this browser");
            return;
        }
        const recognition = new SpeechRecognition();
        recognition.lang = "en-US";
        recognition.interimResults = false;
        recognition.continuous = false;
        recognition.start();
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setInput((prev) => prev + " " + transcript);
        };
        recognition.onerror = (event) => {
            console.error("Speech error:", event.error);
            alert("❌ Voice recognition failed. Please allow microphone access.");
        };
    };
    // ✅ Send message to Gemini backend
    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const text = input.trim();
        setInput("");

        const token = localStorage.getItem("token");

        // ✅ Show user message instantly
        setMessages((prev) => [
            ...prev,
            { role: "user", content: text, timestamp: new Date() },
        ]);

        setTyping(true);

        try {
            // ✅ FIXED: Backend expects { message: text }
           const history = messages
  .filter(m => m.role === "user" || m.role === "ai")
  .slice(-6) // last 6 messages only
  .map(m => ({
    role: m.role,
    content: m.content
  }));

const res = await axios.post(
  "http://localhost:5000/api/ai/chat",
  {
    message: text,
    history
  },
  {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  }
);
            const reply = res.data.reply || res.data.response;
            setTyping(false);

            // ✅ Add AI reply
            setMessages((prev) => [
                ...prev,
                { role: "ai", content: reply, timestamp: new Date() },
            ]);

            // ✅ Show volunteer warning bubble
            if (res.data.wouldRecommendVolunteer) {
                setMessages((prev) => [
                    ...prev,
                    {
                        role: "system",
                        content:
                            "⚠️ I sense you may be feeling low. A volunteer can chat with you anytime 💛",
                        timestamp: new Date(),
                    },
                ]);
            }
        } catch (err) {
            console.log("AI Error:", err.response?.data || err);
            setTyping(false);
        
            if (err.response?.status === 401) {
                alert("Session expired. Please login again.");
                localStorage.removeItem("token");
                navigate("/login");
                return;
            }
            setMessages((prev) => [
                ...prev,
                {
                    role: "ai",
                    content:
                        "❌ AI service is currently unavailable. Please check backend logs.",
                    timestamp: new Date(),
                },
            ]);
        }
    };

    useEffect(() => {
        const loadHistory = async () => {
            const token = localStorage.getItem("token");
            const res = await axios.get(
                "http://localhost:5000/api/ai/history",
            { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessages(
                res.data.map(m => ({
        
                    role: m.role,
                    content: m.content,
                    timestamp: new Date(m.createdAt),
                }))
            );
        };
        loadHistory();
    }, []);
    // ✅ Chat Bubble Component
    const ChatBubble = ({ msg }) => {
        const style =
            msg.role === "user"
                ? styles.userBubble
                : msg.role === "ai"
                ? styles.aiBubble
                : styles.systemBubble;

        return (
            <div style={style}>
                <span style={styles.messageText}>{msg.content}</span>
                <div style={styles.timestamp}>
                    {msg.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                    })}
                </div>
            </div>
        );
    };

    return (
        <div style={{ display: "flex", minHeight: "100vh" }}>
            <Sidebar />

            <main style={styles.page}>
                <h2 style={styles.title}>🤖 AI Companion Chat</h2>
                <p style={styles.subtitle}>Talk, express, and feel supported.</p>

                {/* ✅ Chat Window */}
                <div style={styles.chatWindow}>
                    {messages.map((msg, i) => (
                        <ChatBubble key={i} msg={msg} />
                    ))}

                    {/* Typing Indicator */}
                    {typing && (
                        <div style={styles.aiBubble}>
                            <span style={styles.typingDots}>● ● ●</span>
                        </div>
                    )}

                    <div ref={chatEndRef} />
                </div>

                {/* ✅ Input Bar */}
                <form style={styles.inputBar} onSubmit={handleSend}>
                    <button
                        type="button"
                        style={styles.iconButton}
                        onClick={() => setShowEmoji(!showEmoji)}
                    >
                        <BsEmojiSmile size={20} />
                    </button>

                    {showEmoji && (
                        <div style={styles.emojiPicker}>
                            <EmojiPicker onEmojiClick={handleEmojiClick} />
                        </div>
                    )}

                    <button
                        type="button"
                        style={styles.iconButton}
                        onClick={handleVoiceInput}
                    >
                        <BsMicFill size={20} />
                    </button>

                    <label style={styles.iconButton}>
                        <BsPaperclip size={20} />
                        <input
                            type="file"
                            style={{ display: "none" }}
                            onChange={handleFileUpload}
                        />
                    </label>

                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type a message…"
                        style={styles.input}
                    />

                    <button style={styles.sendButton}>Send</button>
                </form>
            </main>
        </div>
    );
}

/* ✅ Styles */
const styles = {
    page: { flexGrow: 1, padding: "30px", background: "#f5f5fc" },
    title: { fontSize: "28px", color: "#673ab7" },
    subtitle: { color: "#666", marginBottom: "15px" },

    chatWindow: {
        height: "60vh",
        overflowY: "auto",
        padding: "15px",
        borderRadius: "10px",
        background: "#fff",
        boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
        marginBottom: "15px",
    },

    userBubble: {
        background: "#c4f7c9",
        alignSelf: "flex-end",
        padding: "10px",
        maxWidth: "60%",
        borderRadius: "15px 15px 0 15px",
        marginBottom: "10px",
    },

    aiBubble: {
        background: "#e9e9e9",
        padding: "10px",
        maxWidth: "65%",
        borderRadius: "15px 15px 15px 0",
        marginBottom: "10px",
    },

    systemBubble: {
        background: "#fff3cd",
        color: "#8a6d3b",
        padding: "10px",
        maxWidth: "80%",
        borderRadius: "10px",
        margin: "10px auto",
    },

    messageText: { fontSize: "14px" },
    timestamp: { fontSize: "10px", color: "#777", marginTop: "3px" },

    typingDots: {
        fontSize: "20px",
        letterSpacing: "3px",
        color: "#555",
        animation: "blink 1.4s infinite",
    },

    inputBar: {
        display: "flex",
        alignItems: "center",
        background: "#fff",
        padding: "10px",
        borderRadius: "30px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    },

    iconButton: {
        background: "none",
        border: "none",
        margin: "0 8px",
        cursor: "pointer",
        color: "#673ab7",
    },

    emojiPicker: {
        position: "absolute",
        bottom: "80px",
        zIndex: 10,
    },

    input: {
        flexGrow: 1,
        border: "none",
        outline: "none",
        padding: "10px",
        fontSize: "15px",
    },

    sendButton: {
        background: "#673ab7",
        color: "#fff",
        padding: "10px 18px",
        borderRadius: "20px",
        border: "none",
        cursor: "pointer",
        fontWeight: "bold",
    },
};

export default AIChatPage;
