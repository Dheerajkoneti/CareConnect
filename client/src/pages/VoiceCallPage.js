import React from "react";
import { useLocation } from "react-router-dom";

const VoiceCallPage = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const phone = params.get("phone");

  console.log("VOICE CALL PAGE LOADED");
  console.log("URL:", window.location.href);
  console.log("PHONE:", phone);

  if (!phone) {
    return (
      <div style={{ padding: "40px" }}>
        <h2>📞 Voice Call</h2>
        <p style={{ color: "red" }}>❌ Phone number not found</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px" }}>
      <h2>📞 Voice Call</h2>
      <p>Calling volunteer at:</p>
      <h3>{phone}</h3>

      <a href={`tel:${phone}`}>
        <button
          style={{
            padding: "14px 24px",
            background: "#28a745",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          📲 Call Now
        </button>
      </a>
    </div>
  );
};

export default VoiceCallPage;
