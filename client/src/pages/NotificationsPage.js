// client/src/pages/NotificationsPage.js
import { useEffect, useState } from "react";
import api from "../api/axiosInstance";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Fetch notifications
    api.get("/notifications")
      .then(res => setNotifications(res.data))
      .catch(err => console.error(err));

    // Mark all as read
    api.post("/notifications/mark-read").catch(() => {});
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Notifications</h2>

      {notifications.length === 0 && (
        <p>No notifications yet</p>
      )}

      {notifications.map((n) => (
        <div
          key={n._id}
          style={{
            padding: "12px",
            marginBottom: "10px",
            borderRadius: "6px",
            backgroundColor: n.isRead ? "#f4f4f4" : "#e8f0ff",
            borderLeft: n.isRead ? "4px solid #ccc" : "4px solid #3498DB",
          }}
        >
          <h4 style={{ margin: 0 }}>{n.title}</h4>
          <p style={{ margin: "6px 0" }}>{n.message}</p>
          <small>{new Date(n.createdAt).toLocaleString()}</small>
        </div>
      ))}
    </div>
  );
};

export default NotificationsPage;
