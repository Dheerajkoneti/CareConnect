import { useEffect, useState } from "react";
import socket from "../utils/socket";

export default function UserSupportPage() {
  const [status, setStatus] = useState("idle");
  const [volunteer, setVolunteer] = useState(null);

  // 🔔 Request help
  const handleRequestHelp = () => {
    socket.emit("user_request_support", {
      id: "u_001",
      name: "Elderly User",
    });
    setStatus("searching");
  };

  // 🔌 Socket listeners
  useEffect(() => {
    const onMatchFound = ({ room, volunteer }) => {
      setVolunteer(volunteer);
      setStatus("connected");
    };

    const onNoVolunteer = () => {
      setStatus("no_volunteer");
    };

    socket.on("match_found", onMatchFound);
    socket.on("no_volunteer_available", onNoVolunteer);

    // 🧹 Cleanup listeners
    return () => {
      socket.off("match_found", onMatchFound);
      socket.off("no_volunteer_available", onNoVolunteer);
    };
  }, []);

  return (
    <div style={styles.container}>
      <h2>🤝 Support Request</h2>

      {status === "idle" && (
        <button style={styles.button} onClick={handleRequestHelp}>
          Need Support
        </button>
      )}

      {status === "searching" && (
        <p style={styles.info}>🔍 Searching for an available volunteer...</p>
      )}

      {status === "connected" && volunteer && (
        <p style={styles.success}>
          ✅ Connected with <strong>{volunteer.name}</strong>
        </p>
      )}

      {status === "no_volunteer" && (
        <p style={styles.error}>
          ❌ No volunteers available. Please try again later.
        </p>
      )}
    </div>
  );
}

/* 🎨 Simple inline styles */
const styles = {
  container: {
    padding: "40px",
    textAlign: "center",
    fontFamily: "Poppins, sans-serif",
  },
  button: {
    padding: "12px 24px",
    fontSize: "16px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#6c5ce7",
    color: "#fff",
    cursor: "pointer",
  },
  info: {
    fontSize: "16px",
    color: "#555",
  },
  success: {
    fontSize: "18px",
    color: "#2ecc71",
  },
  error: {
    fontSize: "16px",
    color: "#e74c3c",
  },
};