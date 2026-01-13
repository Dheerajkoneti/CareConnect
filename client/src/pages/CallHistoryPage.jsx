import { useEffect, useState } from "react";
import api from "../utils/axiosInstance";

export default function CallHistoryPage() {
  const [calls, setCalls] = useState([]);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!userId) return;

    api.get(`/api/calls/user/${userId}`)
      .then(res => setCalls(res.data.logs || []))
      .catch(err => console.error(err));
  }, [userId]);

  return (
    <div style={{ padding: 20 }}>
      <h2>📞 Call History</h2>

      {calls.length === 0 && <p>No calls yet</p>}

      {calls.map(call => (
        <div key={call._id} style={card}>
          <p><b>Status:</b> {call.status}</p>
          <p><b>Caller:</b> {call.callerId?.fullName}</p>
          <p><b>Receiver:</b> {call.receiverId?.fullName}</p>
          <p><b>Duration:</b> {call.duration}s</p>
          <p><b>Date:</b> {new Date(call.createdAt).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}

const card = {
  background: "#fff",
  padding: 15,
  borderRadius: 8,
  marginBottom: 10,
  boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
};