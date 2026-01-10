// client/src/pages/CallHistory.jsx

import { useEffect, useState } from "react";
import api from "../utils/axiosInstance";

const CallHistory = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await api.get("/api/calls/user/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setLogs(res.data.logs);
      } catch (err) {
        console.error("Failed to fetch call logs", err);
      }
    };

    fetchLogs();
  }, []);

  return (
    <div>
      <h3>📞 Call History</h3>
      {logs.map((log) => (
        <div key={log._id}>
          {log.status} – {new Date(log.createdAt).toLocaleString()}
        </div>
      ))}
    </div>
  );
};

export default CallHistory;