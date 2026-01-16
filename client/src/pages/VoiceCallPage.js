import { useEffect, useRef, useState, useCallback } from "react";
import socket from "../utils/socket";
import "../styles/voicecall.css";

const VoiceCall = () => {
  const [callPhone, setCallPhone] = useState("");
  const [status, setStatus] = useState("idle");

  const pcRef = useRef(null);
  const streamRef = useRef(null);
  const remoteSocketIdRef = useRef(null);
  const socketRef = useRef(socket);

  const createPeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    pc.onicecandidate = (e) => {
      if (e.candidate && remoteSocketIdRef.current) {
        socketRef.current.emit("voice:ice", {
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
  }, []);

  const handleReceiveOffer = useCallback(async ({ from, offer }) => {
    remoteSocketIdRef.current = from;
    setStatus("ringing");

    pcRef.current = createPeerConnection();
    await pcRef.current.setRemoteDescription(offer);

    streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current.getTracks().forEach(track =>
      pcRef.current.addTrack(track, streamRef.current)
    );

    const answer = await pcRef.current.createAnswer();
    await pcRef.current.setLocalDescription(answer);

    socketRef.current.emit("voice:answer", { to: from, answer });
    setStatus("connected");
  }, [createPeerConnection]);

  const handleReceiveAnswer = useCallback(async ({ answer }) => {
    await pcRef.current.setRemoteDescription(answer);
    setStatus("connected");
  }, []);

  const handleNewICE = useCallback(async ({ candidate }) => {
    if (pcRef.current) {
      await pcRef.current.addIceCandidate(candidate);
    }
  }, []);

  const endCall = useCallback(() => {
    pcRef.current?.close();
    streamRef.current?.getTracks().forEach(t => t.stop());

    socketRef.current.emit("voice:end", {
      to: remoteSocketIdRef.current,
    });

    setStatus("idle");
  }, []);

  useEffect(() => {
    socket.on("voice:offer", handleReceiveOffer);
    socket.on("voice:answer", handleReceiveAnswer);
    socket.on("voice:ice", handleNewICE);
    socket.on("voice:end", endCall);

    return () => {
      socket.off("voice:offer", handleReceiveOffer);
      socket.off("voice:answer", handleReceiveAnswer);
      socket.off("voice:ice", handleNewICE);
      socket.off("voice:end", endCall);
    };
  }, [handleReceiveOffer, handleReceiveAnswer, handleNewICE, endCall]);

  const startCall = async () => {
    try {
      setStatus("calling");

      pcRef.current = createPeerConnection();

      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current.getTracks().forEach(track =>
        pcRef.current.addTrack(track, streamRef.current)
      );

      const offer = await pcRef.current.createOffer();
      await pcRef.current.setLocalDescription(offer);

      socketRef.current.emit("voice:offer", {
        offer,
        phone: callPhone,
      });
    } catch (err) {
      console.error(err);
      alert("Call failed");
      setStatus("idle");
    }
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
    </div>
  );
};

export default VoiceCall;