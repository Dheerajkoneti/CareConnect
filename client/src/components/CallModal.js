// client/src/components/CallModal.js
import React, { useEffect, useRef, useState } from "react";
import socket from "../utils/socket";

export default function CallModal({ room, otherUserId, onClose }) {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);

  const [ready, setReady] = useState(false);

  // ✅ Create PeerConnection safely
  const createPeerConnection = () => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" }
      ]
    });

    // ✅ Remote track handler
    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    // ✅ ICE candidate handler
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("webrtc_ice_candidate", {
          room,
          candidate: event.candidate,
        });
      }
    };

    return pc;
  };

  // ✅ MAIN start call function — SAFE
  const startCall = async () => {
    console.log("🚀 Starting call…");

    // ✅ Wait until DOM renders fully
    if (!localVideoRef.current || !remoteVideoRef.current) {
      console.log("Video elements not ready yet, retrying in 200ms…");
      setTimeout(startCall, 200);
      return;
    }

    // ✅ Only run once
    if (pcRef.current) return;

    // ✅ Get webcam
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });

    // ✅ Attach stream safely
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }

    const pc = createPeerConnection();
    pcRef.current = pc;

    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    // ✅ Create & send offer
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    socket.emit("webrtc_offer", {
      room,
      sdp: offer,
      to: otherUserId,
    });
  };

  // ✅ Setup socket listeners
  useEffect(() => {
    socket.emit("join_room", { room });
    setReady(true);

    socket.on("webrtc_offer", async (data) => {
      if (!pcRef.current) pcRef.current = createPeerConnection();

      await pcRef.current.setRemoteDescription(new RTCSessionDescription(data.sdp));

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      const answer = await pcRef.current.createAnswer();
      await pcRef.current.setLocalDescription(answer);

      socket.emit("webrtc_answer", { room, sdp: answer });
    });

    socket.on("webrtc_answer", async (data) => {
      await pcRef.current?.setRemoteDescription(new RTCSessionDescription(data.sdp));
    });

    socket.on("webrtc_ice_candidate", async (data) => {
      if (data.candidate && pcRef.current) {
        try {
          await pcRef.current.addIceCandidate(data.candidate);
        } catch (err) {
          console.error("ICE error:", err);
        }
      }
    });

    return () => {
      socket.off("webrtc_offer");
      socket.off("webrtc_answer");
      socket.off("webrtc_ice_candidate");
    };
  }, []);

  // ✅ Start call only when room + DOM ready
  useEffect(() => {
    if (ready && room) {
      setTimeout(startCall, 300); // ✅ enough time for DOM to render
    }
  }, [ready, room]);

  // ✅ End call
  const endCall = () => {
    socket.emit("call_end", { room });
    pcRef.current?.close();
    pcRef.current = null;
    onClose();
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3>📞 Calling...</h3>

        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          style={styles.video}
        />

        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          style={styles.video}
        />

        <button onClick={endCall} style={styles.endButton}>End Call</button>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999
  },
  modal: {
    background: "white",
    padding: 20,
    width: 420,
    borderRadius: 12,
    textAlign: "center"
  },
  video: {
    width: "100%",
    background: "#000",
    borderRadius: 10,
    marginTop: 12
  },
  endButton: {
    marginTop: 15,
    padding: "10px 16px",
    background: "#E11D48",
    color: "white",
    border: "none",
    borderRadius: 8,
    cursor: "pointer"
  }
};
