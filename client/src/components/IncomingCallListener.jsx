import { useEffect, useState, useRef } from "react";
import socket from "../utils/socket";

export default function IncomingCallListener() {
  const myId = localStorage.getItem("userId");
  const [incomingCall, setIncomingCall] = useState(null);
  const ringtoneRef = useRef(null);

  // 🔔 Listen globally for calls
  useEffect(() => {
    socket.on("incoming-call", (data) => {
      console.log("📞 GLOBAL incoming call:", data);
      setIncomingCall(data);
      playRingtone();
    });

    socket.on("call-rejected", () => {
      stopRingtone();
      setIncomingCall(null);
    });

    const userId = localStorage.getItem("userId");
    if (userId) {
      socket.emit("register-user", userId);
    }

    socket.on("call-accepted", ({ roomId }) => {
      stopRingtone();
      window.location.href = `/video-call/${roomId}`;
    });

    return () => {
      socket.off("incoming-call");
      socket.off("call-rejected");
      socket.off("call-accepted");
    };
  }, []);

  const playRingtone = () => {
    ringtoneRef.current = new Audio("/call.mp3");
    ringtoneRef.current.loop = true;
    ringtoneRef.current.play().catch(() => {});
  };

  const stopRingtone = () => {
    if (ringtoneRef.current) {
      ringtoneRef.current.pause();
      ringtoneRef.current.currentTime = 0;
      ringtoneRef.current = null;
    }
  };

  const acceptCall = () => {
    stopRingtone();

    socket.emit("call-accepted", {
      toUserId: incomingCall.fromUser,
      roomId: incomingCall.roomId,
    });
    window.location.href = `/video-call?room=${roomId}`;
  };

  const rejectCall = () => {
    stopRingtone();

    socket.emit("call-rejected", {
      toUserId: incomingCall.fromUser,
    });

    setIncomingCall(null);
  };

  if (!incomingCall) return null;

  return (
    <div style={modalStyle}>
      <h3>📞 Incoming Call</h3>
      <p>From: {incomingCall.fromUser}</p>

      <div style={{ display: "flex", gap: "10px" }}>
        <button onClick={acceptCall} style={acceptBtn}>Accept</button>
        <button onClick={rejectCall} style={rejectBtn}>Reject</button>
      </div>
    </div>
  );
}

// 🎨 Styles
const modalStyle = {
  position: "fixed",
  bottom: "30px",
  right: "30px",
  background: "#fff",
  padding: "20px",
  borderRadius: "10px",
  boxShadow: "0 5px 20px rgba(0,0,0,0.3)",
  zIndex: 9999,
};

const acceptBtn = {
  background: "#22c55e",
  color: "#fff",
  border: "none",
  padding: "10px 15px",
  borderRadius: "6px",
};

const rejectBtn = {
  background: "#ef4444",
  color: "#fff",
  border: "none",
  padding: "10px 15px",
  borderRadius: "6px",
};