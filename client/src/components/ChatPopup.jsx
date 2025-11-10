import React, { useState, useEffect } from "react";
import socket from "../utils/socket";
import { motion } from "framer-motion";
import { FaTimes, FaPaperPlane } from "react-icons/fa";

export default function ChatPopup({ room, userData, onClose }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  // Listen for incoming messages
  useEffect(() => {
    socket.on("receive_message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
    return () => socket.off("receive_message");
  }, []);

  const sendMessage = () => {
    if (!message.trim()) return;
    const msg = { room, text: message, sender: userData.name };
    socket.emit("send_message", msg);
    setMessages((prev) => [...prev, msg]);
    setMessage("");
  };

  return (
    <motion.div
      className="fixed bottom-5 right-5 w-96 bg-white shadow-2xl rounded-2xl border border-gray-200 flex flex-col overflow-hidden z-50"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
    >
      {/* Header */}
      <div className="bg-purple-700 text-white px-4 py-2 flex justify-between items-center">
        <h2 className="text-lg font-semibold">Chat Session</h2>
        <FaTimes
          onClick={onClose}
          className="cursor-pointer hover:text-gray-200"
        />
      </div>

      {/* Messages */}
      <div className="flex-1 p-3 overflow-y-auto">
        {messages.map((msg, i) => (
          <div key={i} className={`mb-2 ${msg.sender === userData.name ? "text-right" : "text-left"}`}>
            <span
              className={`inline-block px-3 py-2 rounded-xl text-sm ${
                msg.sender === userData.name
                  ? "bg-purple-100 text-purple-800"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {msg.text}
            </span>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="flex border-t border-gray-300">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 p-3 outline-none"
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="bg-purple-700 px-4 text-white flex items-center hover:bg-purple-800"
        >
          <FaPaperPlane className="mr-1" /> Send
        </button>
      </div>
    </motion.div>
  );
}
