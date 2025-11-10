import React, { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import socket from "../utils/socket";

export default function CallRoom() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const room = state?.room;
  const otherUserId = state?.volunteerId;

  const localVideo = useRef(null);
  const remoteVideo = useRef(null);

  const pc = useRef(null);

  useEffect(() => {
    if (!room) return;

    // ✅ Create PeerConnection
    pc.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    });

    // ✅ When remote stream comes in
    pc.current.ontrack = (e) => {
      if (remoteVideo.current) {
        remoteVideo.current.srcObject = e.streams[0];
      } else {
        console.warn("⚠️ remoteVideo ref not ready yet");
      }
    };

    // ✅ ICE Candidate sending
    pc.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("webrtc_ice_candidate", {
          room,
          candidate: event.candidate
        });
      }
    };

    // ✅ Receive ICE
    socket.on("webrtc_ice_candidate", ({ candidate }) => {
      if (candidate) {
        pc.current.addIceCandidate(candidate).catch(console.error);
      }
    });

    // ✅ Receive Offer
    socket.on("webrtc_offer", async ({ offer }) => {
      await pc.current.setRemoteDescription(offer);
      const answer = await pc.current.createAnswer();
      await pc.current.setLocalDescription(answer);

      socket.emit("webrtc_answer", { room, answer });
    });

    // ✅ Receive Answer
    socket.on("webrtc_answer", async ({ answer }) => {
      await pc.current.setRemoteDescription(answer);
    });

    // ✅ Get Camera + Mic
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        if (localVideo.current) {
          localVideo.current.srcObject = stream;
        }

        stream.getTracks().forEach(track => {
          pc.current.addTrack(track, stream);
        });

        // ✅ Create Offer Only For Caller
        if (state?.isCaller) {
          createOffer();
        }
      });

    const createOffer = async () => {
      const offer = await pc.current.createOffer();
      await pc.current.setLocalDescription(offer);

      socket.emit("webrtc_offer", { room, offer });
    };

    socket.emit("join_room", { room });

    // ✅ End Call Event
    socket.on("call_end", () => {
      cleanup();
    });

    return () => {
      cleanup();
    };
  }, [room]);

  const cleanup = () => {
    try {
      pc.current?.close();
    } catch {}
    navigate("/volunteers");
  };

  return (
    <div style={styles.wrapper}>
      <video ref={remoteVideo} autoPlay playsInline style={styles.remote} />
      <video ref={localVideo} autoPlay playsInline muted style={styles.local} />

      <button
        onClick={() => {
          socket.emit("call_end", { room });
          cleanup();
        }}
        style={styles.endBtn}
      >
        🔴 End Call
      </button>
    </div>
  );
}

const styles = {
  wrapper: {
    position: "relative",
    width: "100vw",
    height: "100vh",
    background: "#000",
  },
  remote: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  local: {
    position: "absolute",
    width: "240px",
    height: "160px",
    bottom: 20,
    right: 20,
    background: "#333",
    borderRadius: 8,
  },
  endBtn: {
    position: "absolute",
    bottom: 25,
    left: "50%",
    transform: "translateX(-50%)",
    background: "#ef4444",
    color: "#fff",
    padding: "10px 20px",
    borderRadius: 50,
    border: "none",
    fontSize: "18px",
    cursor: "pointer",
  },
};
