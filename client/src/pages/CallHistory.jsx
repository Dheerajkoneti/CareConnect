import { useEffect, useState } from "react";
import axios from "axios";

const CallHistory = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "http://localhost:5000/api/calls/user/me",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLogs(res.data.logs);
    };

    fetchLogs();
  }, []);

  return (
    <div>
      <h3>📜 Call History</h3>
      {logs.map((log) => (
        <div key={log._id}>
          📞 {log.status} – {new Date(log.createdAt).toLocaleString()}
        </div>
      ))}
    </div>
  );
};

export default CallHistory;
