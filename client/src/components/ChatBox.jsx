import React, { useState, useEffect } from 'react';
import socket from '../utils/socket';

export default function ChatBox({ sessionRoom, onClose }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    socket.on('receive_message', (msg) => setMessages(prev => [...prev, msg]));
    return () => socket.off('receive_message');
  }, []);

  const sendMessage = () => {
    if (!text.trim()) return;
    socket.emit('send_message', { room: sessionRoom, text, sender: "user" });
    setMessages(prev => [...prev, { text, sender: "user" }]);
    setText("");
  };

  return (
    <div className="fixed bottom-5 right-5 w-[350px] bg-white rounded-xl shadow-xl border border-gray-200 flex flex-col overflow-hidden z-50">
      <div className="bg-purple-600 text-white px-4 py-2 text-lg font-semibold">Chat Support</div>
      <div className="flex-1 p-3 overflow-y-auto">
        {messages.map((m, i) => (
          <div key={i} className={`mb-2 text-sm ${m.sender === 'user' ? 'text-right' : 'text-left'}`}>
            <span className={`inline-block px-3 py-2 rounded-lg ${m.sender === 'user' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-700'}`}>
              {m.text}
            </span>
          </div>
        ))}
      </div>
      <div className="flex border-t border-gray-200">
        <input
          type="text"
          placeholder="Type a message..."
          className="flex-1 p-2 outline-none"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage} className="bg-purple-600 text-white px-4">Send</button>
      </div>
      <button onClick={onClose} className="text-gray-500 text-sm py-2 hover:text-red-500">End Chat</button>
    </div>
  );
}
