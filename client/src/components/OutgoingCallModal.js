import React from "react";

export default function OutgoingCallModal({ calleeName, onCancel }) {
  return (
    <div style={styles.overlay}>
      <div style={styles.box}>
        <h2>📤 Calling…</h2>
        <p>Waiting for <b>{calleeName}</b> to respond</p>

        <button style={styles.cancel} onClick={onCancel}>
          ❌ Cancel Call
        </button>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.35)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 99999,
  },
  box: {
    width: 360,
    padding: 20,
    background: "#fff",
    borderRadius: 12,
    textAlign: "center",
  },
  cancel: {
    marginTop: 20,
    padding: "10px 18px",
    background: "#ef4444",
    color: "#fff",
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
  },
};
