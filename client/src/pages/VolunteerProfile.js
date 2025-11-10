// client/src/pages/VolunteerProfile.js
import React, { useEffect, useState } from "react";
import socket from "../utils/socket";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

/**
 * VolunteerProfile - page where a volunteer sees their profile and pending incoming requests.
 * - volunteerId should be the logged-in volunteer id from auth. For demo we accept :id param.
 */

export default function VolunteerProfile() {
  const navigate = useNavigate();
  const { id } = useParams(); // /volunteer/profile/:id
  const volunteerId = id || "v_001"; // fallback - replace with real auth id in production

  const [profile, setProfile] = useState(null);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [status, setStatus] = useState("available");

  useEffect(() => {
    // Load volunteer profile from API
    const loadProfile = async () => {
      try {
        const res = await axios.get(`/api/volunteers/${volunteerId}`);
        setProfile(res.data);
        setStatus(res.data?.status || "available");
      } catch (err) {
        console.warn("Profile load failed", err);
      }
    };
    loadProfile();

    // Register this socket as volunteer
    socket.emit("volunteer_register", { volunteerId });

    // Listen for incoming requests
    socket.on("incoming_request", (payload) => {
      // payload = { requestId, from: { userId, userName }, type }
      if (String(payload.toVolunteerId) === String(volunteerId) || !payload.toVolunteerId) {
        setIncomingRequests((prev) => [payload, ...prev]);
        // optional: play sound
        const audio = new Audio("https://cdn.pixabay.com/download/audio/2022/03/15/audio_c19cfb8f94.mp3");
        audio.play().catch(() => {});
      }
    });

    // Update status when server notifies
    socket.on("status_updated", ({ volunteerId: vid, status }) => {
      if (String(vid) === String(volunteerId)) setStatus(status);
    });

    return () => {
      socket.off("incoming_request");
      socket.off("status_updated");
    };
  }, [volunteerId]);

  const respond = (request, accept) => {
    socket.emit("invite_response", {
      requestId: request.requestId,
      volunteerId,
      userId: request.from.userId,
      accept,
      type: request.type,
    });
    // remove from list locally
    setIncomingRequests((prev) => prev.filter((r) => r.requestId !== request.requestId));
    if (accept) {
      setStatus("busy");
      // server should emit invite_accepted_local to volunteer with room info
    }
  };

  const toggleAvailability = () => {
    const newStatus = status === "available" ? "busy" : "available";
    socket.emit("volunteer_status_update", { volunteerId, status: newStatus });
    setStatus(newStatus);
  };

  return (
    <div style={{ padding: 28 }}>
      <h2>Volunteer Profile</h2>
      <div style={{ display: "flex", gap: 18 }}>
        <div style={{ minWidth: 320, background: "#fff", padding: 18, borderRadius: 8 }}>
          <h3>{profile?.name || `Volunteer ${volunteerId}`}</h3>
          <p><b>Role:</b> {profile?.role || profile?.skills || "Volunteer"}</p>
          <p><b>Email:</b> {profile?.email || "—"}</p>
          <p><b>Status:</b> <strong>{status}</strong></p>
          <button onClick={toggleAvailability} style={{ padding: "8px 12px", borderRadius: 6, background: "#6A1B9A", color: "#fff" }}>
            {status === "available" ? "Set Busy" : "Set Available"}
          </button>
        </div>

        <div style={{ flex: 1 }}>
          <h3>📩 Incoming Requests</h3>
          {incomingRequests.length === 0 ? (
            <p>No incoming requests</p>
          ) : (
            incomingRequests.map((r) => (
              <div key={r.requestId} style={{ background: "#fff", padding: 12, borderRadius: 8, marginBottom: 10 }}>
                <p><b>From:</b> {r.from.userName} ({r.from.userId})</p>
                <p><b>Type:</b> {r.type}</p>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => respond(r, true)} style={{ background: "#16a34a", color: "#fff", padding: "8px 12px", borderRadius: 6 }}>Accept</button>
                  <button onClick={() => respond(r, false)} style={{ background: "#dc2626", color: "#fff", padding: "8px 12px", borderRadius: 6 }}>Decline</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div style={{ marginTop: 28 }}>
        <button onClick={() => navigate("/volunteers")} style={{ padding: "8px 12px", borderRadius: 6 }}>Back to Volunteer Hub</button>
      </div>
    </div>
  );
}
