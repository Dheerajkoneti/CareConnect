import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import axios from "axios";
import "../styles/voicecall.css"; // ✅ CSS import


const VoiceCall = () => {
  const [callPhone, setCallPhone] = useState("");
  const [status, setStatus] = useState("idle");
  const pcRef = useRef(null);
  const streamRef = useRef(null);
  const remoteSocketIdRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
  if (!socketRef.current) {
    socketRef.current = io(process.env.REACT_APP_API_URL, {
      transports: ["websocket"],
    });
  }

  const socket = socketRef.current;

  socket.on("voice:offer", handleReceiveOffer);
  socket.on("voice:answer", handleReceiveAnswer);
  socket.on("voice:ice", handleNewICE);
  socket.on("voice:end", endCall);

  return () => {
    socket.off("voice:offer");
    socket.off("voice:answer");
    socket.off("voice:ice");
    socket.off("voice:end");
  };
}, []);

  const createPeerConnection = () => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    pc.onicecandidate = (e) => {
      if (e.candidate && remoteSocketIdRef.current) {
        socket.emit("voice:ice", {
          to: remoteSocketIdRef.current,
          candidate: e.candidate,
        });
      }
    };

    pc.ontrack = (e) => {
      const audio = document.createElement("audio");
      audio.srcObject = e.streams[0];
      audio.autoplay = true;
    };

    return pc;
  };

  const startCall = async () => {
    try {
      setStatus("calling");

      pcRef.current = createPeerConnection();

      streamRef.current = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      streamRef.current.getTracks().forEach((track) =>
        pcRef.current.addTrack(track, streamRef.current)
      );

      const offer = await pcRef.current.createOffer();
      await pcRef.current.setLocalDescription(offer);

      socket.emit("voice:offer", {
        offer,
        phone: callPhone,
      });
    } catch (err) {
      console.error(err);
      alert("Call failed");
      setStatus("idle");
    }
  };

  const handleReceiveOffer = async ({ from, offer }) => {
    remoteSocketIdRef.current = from;
    setStatus("ringing");

    pcRef.current = createPeerConnection();
    await pcRef.current.setRemoteDescription(offer);

    streamRef.current = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });

    streamRef.current.getTracks().forEach((track) =>
      pcRef.current.addTrack(track, streamRef.current)
    );

    const answer = await pcRef.current.createAnswer();
    await pcRef.current.setLocalDescription(answer);

    socket.emit("voice:answer", { to: from, answer });
    setStatus("connected");
  };

  const handleReceiveAnswer = async ({ answer }) => {
    await pcRef.current.setRemoteDescription(answer);
    setStatus("connected");
  };

  const handleNewICE = async ({ candidate }) => {
    if (pcRef.current) {
      await pcRef.current.addIceCandidate(candidate);
    }
  };

  const endCall = () => {
    pcRef.current?.close();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setStatus("idle");
  };

  return (
    <div className="voicecall-page">
      <div className="call-card">
        <h2>📞 Voice Call</h2>

        <input
          placeholder="Enter phone number"
          value={callPhone}
          onChange={(e) => setCallPhone(e.target.value)}
        />

        <button onClick={startCall}>Start Call</button>

        <p className={`status ${status}`}>
          🟢 Status: {status.toUpperCase()}
        </p>
      </div>

      <p className="coming-soon">
        🚀 Advanced calling features coming soon...
      </p>
    </div>
  );
};

/* ✅ EXPORT MUST BE OUTSIDE EVERYTHING */
export default VoiceCall;
