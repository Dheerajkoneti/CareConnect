import React from "react";

export default function IncomingCallModal({ callerName, onAccept, onReject }) {
  return (
    <div style={styles.overlay}>
      <div style={styles.box}>
        <h2>📞 Incoming Call</h2>
        <p><b>{callerName}</b> is calling you…</p>

        <div style={styles.actions}>
          <button style={styles.accept} onClick={onAccept}>✅ Accept</button>
          <button style={styles.reject} onClick={onReject}>❌ Reject</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.4)",
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
    boxShadow: "0 12px 30px rgba(0,0,0,0.15)",
  },
  actions: {
    marginTop: 20,
    display: "flex",
    justifyContent: "center",
    gap: 15,
  },
  accept: {
    padding: "10px 20px",
    background: "#059669",
    color: "#fff",
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
  },
  reject: {
    padding: "10px 20px",
    background: "#dc2626",
    color: "#fff",
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
  },
};
