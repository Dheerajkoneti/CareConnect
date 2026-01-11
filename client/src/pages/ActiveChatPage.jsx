import { useEffect, useState, useRef } from "react";
import socket from "../utils/socket";

/*
  This file ONLY handles:
  - Socket registration
  - Incoming call notification
  - Accept / Reject logic
  - Start call
*/

export default function ActiveChatPage() {
  // --------------------------------------------------
  // 🔐 USER
  // --------------------------------------------------
  const myId = localStorage.getItem("userId");

  // --------------------------------------------------
  // 📞 CALL STATE
  // --------------------------------------------------
  const [incomingCall, setIncomingCall] = useState(null);
  const ringtoneRef = useRef(null);

  // --------------------------------------------------
  // 🔗 REGISTER USER SOCKET (MANDATORY)
  // --------------------------------------------------
  useEffect(() => {
    if (!myId) return;

    socket.emit("register-user", myId);
    console.log("✅ Socket registered for user:", myId);

    return () => {
      socket.off("register-user");
    };
  }, [myId]);

  // --------------------------------------------------
  // 📞 INCOMING CALL LISTENER
  // --------------------------------------------------
  useEffect(() => {
    socket.on("incoming-call", (data) => {
      console.log("📞 Incoming call:", data);
      setIncomingCall(data);
      playRingtone();
    });

    socket.on("call-accepted", ({ roomId }) => {
      stopRingtone();
      window.location.href = `/video-call/${roomId}`;
    });

    socket.on("call-rejected", () => {
      stopRingtone();
      alert("❌ Call rejected");
      setIncomingCall(null);
    });

    return () => {
      socket.off("incoming-call");
      socket.off("call-accepted");
      socket.off("call-rejected");
    };
  }, []);

  // --------------------------------------------------
  // 🔊 RINGTONE
  // --------------------------------------------------
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

  // --------------------------------------------------
  // 📞 START CALL (CALLER)
  // --------------------------------------------------
  const startCall = (targetUserId) => {
    const roomId = window.crypto.randomUUID();

    socket.emit("call-user", {
      toUserId: targetUserId,
      fromUser: myId,
      roomId,
    });

    console.log("📞 Calling user:", targetUserId);
  };

  // --------------------------------------------------
  // ✅ ACCEPT CALL (RECEIVER)
  // --------------------------------------------------
  const acceptCall = () => {
    stopRingtone();

    socket.emit("call-accepted", {
      toUserId: incomingCall.fromUser,
      roomId: incomingCall.roomId,
    });

    window.location.href = `/video-call/${incomingCall.roomId}`;
  };

  // --------------------------------------------------
  // ❌ REJECT CALL (RECEIVER)
  // --------------------------------------------------
  const rejectCall = () => {
    stopRingtone();

    socket.emit("call-rejected", {
      toUserId: incomingCall.fromUser,
    });

    setIncomingCall(null);
  };

  // --------------------------------------------------
  // 🧱 UI
  // --------------------------------------------------
  return (
    <div style={{ padding: "20px" }}>
      <h2>💬 Active Chat</h2>

      {/* EXAMPLE CALL BUTTON */}
      <button
        onClick={() => startCall("REPLACE_WITH_TARGET_USER_ID")}
        style={{ padding: "10px", marginTop: "20px" }}
      >
        📞 Call User
      </button>

      {/* INCOMING CALL MODAL */}
      {incomingCall && (
        <div style={modalStyle}>
          <h3>📞 Incoming Call</h3>
          <p>From: {incomingCall.fromUser}</p>

          <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
            <button onClick={acceptCall} style={acceptBtn}>
              Accept
            </button>
            <button onClick={rejectCall} style={rejectBtn}>
              Reject
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// --------------------------------------------------
// 🎨 STYLES
// --------------------------------------------------
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
  cursor: "pointer",
};

const rejectBtn = {
  background: "#ef4444",
  color: "#fff",
  border: "none",
  padding: "10px 15px",
  borderRadius: "6px",
  cursor: "pointer",
};