// client/src/pages/VideoCallPage.js
import React, { useEffect, useMemo, useRef, useState } from "react";
import Sidebar from "../components/Sidebar";
import socket from "../utils/socket";
import api from "../utils/axiosInstance";
import {
  FaPhoneSlash,
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash,
  FaSyncAlt,
  FaLink,
  FaCopy,
  FaUsers,
  FaComments,
  FaSearch,
} from "react-icons/fa";
import "../styles/VideoCallPage.css";

// ✅ Toast helper
const toast = (msg) => {
  const el = document.createElement("div");
  el.className = "toast";
  el.innerText = msg;
  document.body.appendChild(el);
  setTimeout(() => el.classList.add("show"), 20);
  setTimeout(() => {
    el.classList.remove("show");
    setTimeout(() => el.remove(), 300);
  }, 2800);
};
// ✅ Helper for random room
const genRoom = () => Math.random().toString(36).slice(2, 8);
const pcConfig = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },

    // ✅ TURN server (REQUIRED for mobile & production)
    {
      urls: "turn:openrelay.metered.ca:80",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
    {
      urls: "turn:openrelay.metered.ca:443",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
  ],
};
export default function VideoCallPage() {
  // ------------------------------------------------------------
  // Identity (fallback for local)
  // ------------------------------------------------------------
  const myId =
    localStorage.getItem("userId") ||
    localStorage.getItem("uid") ||
    "user_" + Math.random().toString(36).slice(2, 6);

  const myName = localStorage.getItem("userName") || "You";
  const myRole = localStorage.getItem("role") || "community_member";
  // ------------------------------------------------------------
  // UI + meeting state
  // ------------------------------------------------------------
  //const [status] = useState("active");
  //const [customStatus] = useState("");
  const [room, setRoom] = useState(() => {
    const url = new URL(window.location.href);
    return url.searchParams.get("room") || "";
  });
  const [shareUrl, setShareUrl] = useState("");
  const [muted, setMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);
  const [status] = useState("active");
  const [customStatus] = useState("");
  const [inCall, setInCall] = useState(false);
  // ------------------------------------------------------------
  // Media & WebRTC
  // ------------------------------------------------------------
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const streamRef = useRef(null);
  const pcRef = useRef(null);
  // ------------------------------------------------------------
  // Presence & Directory
  // ------------------------------------------------------------
  const [presence, setPresence] = useState([]);
  const [directory, setDirectory] = useState([]);
  const [dirQuery, setDirQuery] = useState("");

  const filteredDirectory = useMemo(() => {
    const q = dirQuery.trim().toLowerCase();
    if (!q) return directory;
    return directory.filter(
      (u) =>
        String(u.name || u.fullName || "")
          .toLowerCase()
          .includes(q) ||
        String(u.email || "").toLowerCase().includes(q)
    );
  }, [directory, dirQuery]);

  // ------------------------------------------------------------
  // Chat state
  // ------------------------------------------------------------
  const [chat, setChat] = useState([]);
  const [chatInput, setChatInput] = useState("");

  // ------------------------------------------------------------
  // INITIAL SETUP
  // ------------------------------------------------------------
  useEffect(() => {
    // ✅ 1: Setup identity
    socket.emit("register-user", myId);
    // ✅ 2: Presence stream
    socket.on("presence:list", (list) => setPresence(list || []));

    // ✅ 3: Fetch directory
    (async () => {
      try {
        const res = await api.get("/api/users/all");
        setDirectory(Array.isArray(res.data) ? res.data : []);
      } catch (err){
        console.error("Directory fetch failed", err);
        setDirectory([]);
      }
    })();

    // ✅ 4: Start camera immediately
    startLocalMedia();

    // ✅ 5: Chat channel
    socket.on("vc:chat", (msg) => {
      if (msg?.room === room) {
        setChat((p) => [...p, msg]);
      }
    });

    // ✅ 6: WebRTC handlers
    socket.on("webrtc_offer", handleOffer);
    socket.on("webrtc_answer", handleAnswer);
    socket.on("webrtc_ice_candidate", handleIce);
    return () => {
      socket.off("presence:list");
      socket.off("vc:chat");
      socket.off("webrtc_offer");
      socket.off("webrtc_answer");
      socket.off("webrtc_ice_candidate");
      socket.off("call:ended");
      teardownEverything();
    };
    // eslint-disable-next-line
  }, []);
  // Keep share URL correct
  useEffect(() => {
    const base = `${window.location.origin}/video-call`;
    setShareUrl(room ? `${base}?room=${room}` : "");
  }, [room]);
  // ------------------------------------------------------------
  // WebRTC: media helpers
  // ------------------------------------------------------------
  async function startLocalMedia(facingMode) {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: { facingMode: facingMode || "user" },
      });
      streamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      // Replace tracks in active call
      if (pcRef.current) {
        const vTrack = stream.getVideoTracks()[0];
        const aTrack = stream.getAudioTracks()[0];
        const senders = pcRef.current.getSenders();
        const vSender = senders.find((s) => s.track?.kind === "video");
        const aSender = senders.find((s) => s.track?.kind === "audio");
        if (vSender) vSender.replaceTrack(vTrack);
        if (aSender) aSender.replaceTrack(aTrack);
      }
    } catch (err) {
      console.error(err);
      alert("Camera or microphone permission denied.");
    }
  }
  function stopLocalMedia() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
  }
  // ------------------------------------------------------------
  // WebRTC: PeerConnection
  // ------------------------------------------------------------
  function ensurePc() {
    if (pcRef.current) return pcRef.current;
    const pc = new RTCPeerConnection(pcConfig);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, streamRef.current);
      });
    }
    pc.onicecandidate = (e) => {
      if (e.candidate && room) {
        socket.emit("webrtc_ice_candidate", {
          room,
          candidate: e.candidate,
        });
      }
    };
    pc.ontrack = (e) => {
      const [remoteStream] = e.streams;
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
    };
    pc.onconnectionstatechange = () => {
      if (["failed", "disconnected", "closed"].includes(pc.connectionState)) {
        teardownCall();
      }
    };
    pcRef.current = pc;
    return pc;
  }
  async function handleOffer({ room: r, sdp }) {
    if (r !== room) return;
    if (!streamRef.current) {
      await startLocalMedia(); // 🔥 REQUIRED
    }
    socket.emit("join_room", {
      room: r,
      user: { _id: myId, name: myName, role: myRole },
    });
    const pc = ensurePc();
    await pc.setRemoteDescription(new RTCSessionDescription(sdp));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    socket.emit("webrtc_answer", { room: r, sdp: answer });
    setInCall(true);
    toast("✅ Call connected");
  }
  async function handleAnswer({ room: r, sdp }) {
    if (r !== room) return;
    await pcRef.current?.setRemoteDescription(
      new RTCSessionDescription(sdp)
    );
  }
  async function handleIce(data) {
    if (data.room !== room) return;
    try {
      await pcRef.current?.addIceCandidate(
        new RTCIceCandidate(data.candidate)
      );
    } catch {}
  }
  function handleCallEnd() {
    toast("⭕ Call ended");
    teardownCall();
  }
  // ------------------------------------------------------------
  // WebRTC Start Call
  // ------------------------------------------------------------
async function startCallWithRoom(r) {
  if (!r || pcRef.current) return;
    setRoom(r);
    if (!streamRef.current) {
      await startLocalMedia(); // ✅ ensure media exists
    }
    socket.emit("join_room", {
      room: r,
      user: {
        _id: myId,
        name: myName,
        role: myRole,
      },
    });
    const pc = ensurePc();
    const offer = await pc.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    });
    await pc.setLocalDescription(offer);
    socket.emit("webrtc_offer", { room: r, sdp: offer });
    setInCall(true);
    toast("📞 Calling user...");
  }
  // ------------------------------------------------------------
  // Chat
  // ------------------------------------------------------------
  function sendChat(e) {
    e.preventDefault();
    if (!chatInput.trim() || !room) return;
    const msg = {
      room,
      text: chatInput,
      from: { id: myId, name: myName },
      ts: Date.now(),
    };
    socket.emit("vc:chat", msg);
    setChat((p) => [...p, msg]);
    setChatInput("");
  }
  // ------------------------------------------------------------
  // Controls
  // ------------------------------------------------------------
  function toggleMic() {
    const enabled =
      streamRef.current
        ?.getAudioTracks()
        .every((track) => track.enabled) ?? false;

    streamRef.current?.getAudioTracks().forEach((t) => (t.enabled = !enabled));
    setMuted(enabled);
  }
  function toggleCam() {
    const enabled =
      streamRef.current
        ?.getVideoTracks()
        .every((track) => track.enabled) ?? false;

    streamRef.current?.getVideoTracks().forEach((t) => (t.enabled = !enabled));
    setCamOff(enabled);
  }
  async function flipCamera() {
    const mode =
      streamRef.current?.getVideoTracks()[0]?.getSettings()?.facingMode;
    const next = mode === "environment" ? "user" : "environment";
    await startLocalMedia(next);
  }
  function endCall() {
    if (room) {
      socket.emit("call_end", { room });
    }
    teardownCall();
  }
  function teardownCall() {
    setInCall(false);
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
  }
  function teardownEverything() {
    teardownCall();
    stopLocalMedia();
  }
  // ------------------------------------------------------------
  // Render
  // ------------------------------------------------------------
  return (
    <div className="video-call-page">
      <Sidebar />
      <div className="vc-container">
        {/* -------------------- TITLE + STATUS -------------------- */}
        <div className="topbar">
          <div className="title">📞 Live Video Call</div>
          <div className="status-chip">
            <span
              className="status-dot"
              style={{
                background:
                  status === "active"
                    ? "#10b981"
                    : status === "away"
                    ? "#f59e0b"
                    : status === "dnd"
                    ? "#ef4444"
                    : "#9ca3af",
              }}
            />
            {customStatus || status}
          </div>
        </div>
        {/* -------------------- VIDEO SECTION -------------------- */}
        <div className="video-section">
          <div className="video-box-container">
            <video
              ref={localVideoRef}
              muted
              autoPlay
              playsInline
              className="video-box my-video"
            />
            <div className="video-label">You</div>
          </div>

          <div className="video-box-container">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="video-box"
            />
            <div className="video-label">Peer</div>
          </div>
        </div>

        {/* -------------------- CONTROLS -------------------- */}
        <div className="controls">
          <button
            className={`control-btn ${muted ? "danger" : ""}`}
            onClick={toggleMic}
          >
            {muted ? <FaMicrophoneSlash /> : <FaMicrophone />}
          </button>

          <button
            className={`control-btn ${camOff ? "danger" : ""}`}
            onClick={toggleCam}
          >
            {camOff ? <FaVideoSlash /> : <FaVideo />}
          </button>

          <button className="control-btn" onClick={flipCamera}>
            <FaSyncAlt />
          </button>

          <button className="control-btn end" onClick={endCall}>
            <FaPhoneSlash />
          </button>
        </div>

        {/* -------------------- LINK TOOLS -------------------- */}
        <div className="link-tools">

          {/* Generate Link */}
          <div className="link-block">
            <FaLink />
            <button
              className="small-btn"
              onClick={() => {
                const r = genRoom();
                setRoom(r);
                toast("✅ Room generated");
              }}
            >
              Generate
            </button>

            <input
              className="link-input"
              readOnly
              value={shareUrl}
            />

            <button
              className="small-btn"
              onClick={() => {
                navigator.clipboard.writeText(shareUrl);
                toast("🔗 Link Copied!");
              }}
            >
              <FaCopy />
            </button>
          </div>

          {/* Join */}
          <div className="join-inline">
            <input
              className="link-input"
              placeholder="Enter room code"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
            />
            <button
              className="small-btn"
              onClick={() => {
                if (!room) return toast("⚠️ Enter a valid room code");
                socket.emit("join_room", {
                  room,
                  user: {
                    _id: myId,
                    name: myName,
                    role: myRole,
                  },
                });
                toast("✅ Joined room");
              }}
            >
              Join
            </button>

            <button
              className="small-btn"
              onClick={() => startCallWithRoom(room)}
              disabled={!room}
            >
              Start Call
            </button>
          </div>
        </div>

        {/* -------------------- THREE PANELS -------------------- */}
        <div className="triple-panels">

          {/* LEFT: CHAT */}
          <div className="panel chat-panel">
            <div className="panel-title">
              <FaComments /> Chat
            </div>

            <div className="chat-window">
              {chat.map((m, i) => (
                <div
                  key={i}
                  className={`chat-message ${
                    m.from.id === myId ? "me" : ""
                  }`}
                >
                  <strong>{m.from.name}:</strong> {m.text}
                </div>
              ))}
            </div>

            <form className="chat-form" onSubmit={sendChat}>
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type message..."
              />
              <button className="send-btn">Send</button>
            </form>
          </div>

          {/* CENTER: PARTICIPANTS */}
          <div className="panel participant-panel">
            <div className="panel-title">
              <FaUsers /> Participants ({presence.length})
            </div>

            <div className="list">
              {presence.map((p) => (
                <div key={p.socketId} className="row">
                  <div className="avatar">{(p.name || "U")[0]}</div>

                  <div className="meta">
                    <div className="name">
                      {p.name}{" "}
                      {String(p.userId) === String(myId) && "(You)"}
                    </div>

                    <div className="role">{p.role}</div>

                    <div className="status-line">
                      <span
                        className="dot"
                        style={{
                          background:
                            p.status === "active"
                              ? "#10b981"
                              : p.status === "away"
                              ? "#f59e0b"
                              : p.status === "dnd"
                              ? "#ef4444"
                              : "#9ca3af",
                        }}
                      ></span>
                      <span>{p.customStatus || p.status}</span>
                    </div>
                  </div>

                  {/* Call button */}
                  {String(p.userId) !== String(myId) && (
                    <button
                    className="thin-btn"
                    onClick={() => {
                    const roomId = `${myId}_${p.userId}`;
                    // 🔔 Notify receiver
                    socket.emit("call-user", {
                      toUserId: p.userId,
                      fromUser: myId,
                      roomId,
                    });
                    // Caller joins room immediately
                    startCallWithRoom(roomId);
                    toast(`📞 Calling ${p.name}`);
                    }}
                    >
                    Call
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
          {/* RIGHT: USER DIRECTORY */}
          <div className="panel directory-panel">
            <div className="panel-title">CareConnect Users</div>

            <div className="search-row">
              <FaSearch />
              <input
                placeholder="Search users..."
                value={dirQuery}
                onChange={(e) => setDirQuery(e.target.value)}
              />
            </div>

            <div className="list">
              {filteredDirectory.map((u) => (
                <div key={u._id} className="row">
                  <div className="avatar">{(u.name || "U")[0]}</div>

                  <div className="meta">
                    <div className="name">{u.name}</div>
                    <div className="role">{u.email}</div>

                    <div className="status-line">
                      <span
                        className="dot"
                        style={{
                          background:
                            u.status === "active"
                              ? "#10b981"
                              : u.status === "away"
                              ? "#f59e0b"
                              : u.status === "dnd"
                              ? "#ef4444"
                              : "#9ca3af",
                        }}
                      ></span>
                      <span>{u.customStatus || u.status}</span>
                    </div>
                  </div>

                  <button
                    className="thin-btn"
                    onClick={() => {
                      const r = `${myId}_${u._id}`;
                      startCallWithRoom(r);
                      toast(`📞 Calling ${u.name}`);
                    }}
                  >
                    Call
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
