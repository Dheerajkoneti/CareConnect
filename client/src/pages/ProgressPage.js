import React, { useEffect, useState } from "react";
import axios from "axios";
import { Pie, Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
} from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement
);

// ✅ API Endpoints
const API_TASKS = "http://localhost:5000/api/tasks";
const API_CALLS = "http://localhost:5000/api/calllogs";  // fixed
const API_POSTS = "http://localhost:5000/api/community";
const API_MOOD = "http://localhost:5000/api/mood";

function ProgressPage() {
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  // ✅ DASHBOARD STATE
  const [tasks, setTasks] = useState([]);
  const [callLogs, setCallLogs] = useState([]);
  const [posts, setPosts] = useState([]);
  const [moodLogs, setMoodLogs] = useState([]);

  // ✅ LOAD TASKS
  const loadTasks = async () => {
    const res = await axios.get(`${API_TASKS}/user/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setTasks(res.data.tasks);
  };

  // ✅ COMPLETE TASK INSIDE PROGRESS PAGE
  const toggleTask = async (task) => {
    const res = await axios.put(
      `${API_TASKS}/${task._id}/complete`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // Update task in UI
    setTasks((prev) =>
      prev.map((t) => (t._id === task._id ? res.data.task : t))
    );
  };

  // ✅ LOAD CALL LOGS
  const loadCallLogs = async () => {
    const res = await axios.get(`${API_CALLS}/user/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setCallLogs(res.data.logs);
  };

  // ✅ LOAD POSTS
  const loadPosts = async () => {
    const res = await axios.get(`${API_POSTS}/posts`);
    setPosts(res.data.filter((p) => p.authorId === userId));
  };

  // ✅ LOAD MOOD LOGS
  const loadMood = async () => {
    const res = await axios.get(`${API_MOOD}/user/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setMoodLogs(res.data.logs);
  };

  // ✅ Load everything at start
  useEffect(() => {
    loadTasks();
    loadCallLogs();
    loadPosts();
    loadMood();
  }, []);

  // ✅ TASK ANALYTICS
  const completedTasks = tasks.filter((t) => t.completed);
  const pendingTasks = tasks.filter((t) => !t.completed);
  const addedByUser = tasks.slice(5); // after default 5 tasks

  const totalTasks = tasks.length;
  const totalCompleted = completedTasks.length;
  const totalPending = pendingTasks.length;

  // ✅ CALL ANALYTICS
  const totalCalls = callLogs.length;
  const totalCallMinutes = callLogs.reduce(
    (sum, c) => sum + Math.round((c.duration || 0) / 60),
    0
  );

  // ✅ MOOD ANALYTICS
  const moodValues = moodLogs.map((m) => m.score);
  const moodLabels = moodLogs.map((m) =>
    new Date(m.createdAt).toLocaleDateString()
  );

  return (
    <div style={styles.page}>
      <h1 style={styles.heading}>Progress & Insights</h1>

      {/* ✅ TOP ANALYTICS CARDS */}
      <div style={styles.grid}>
        <div style={styles.card}>
          <h2>Tasks</h2>
          <p>Total: {totalTasks}</p>
          <p>Completed: {totalCompleted}</p>
          <p>Pending: {totalPending}</p>
        </div>

        <div style={styles.card}>
          <h2>Video Calls</h2>
          <p>Total Calls: {totalCalls}</p>
          <p>Minutes Spent: {totalCallMinutes}</p>
        </div>

        <div style={styles.card}>
          <h2>Posts</h2>
          <p>Total Posts: {posts.length}</p>
        </div>

        <div style={styles.card}>
          <h2>Mood Tracking</h2>
          <p>Total Logs: {moodLogs.length}</p>
          {moodLogs.length > 0 && (
            <p>Last Mood: {moodLogs[moodLogs.length - 1].score}/10</p>
          )}
        </div>
      </div>

      {/* ✅ Smaller Pie Chart */}
      <div style={styles.chartBoxSmall}>
        <h3>Productivity</h3>
        <Pie
          width={200}
          height={200}
          data={{
            labels: ["Completed", "Pending"],
            datasets: [
              {
                data: [totalCompleted, totalPending],
                backgroundColor: ["#6A1B9A", "#ccc"],
              },
            ],
          }}
        />
      </div>

      {/* ✅ ✅ TASK SECTIONS */}
      <div style={styles.section}>
        <h2>Your Tasks</h2>

        <h3>✅ Completed Tasks</h3>
        <ul>
          {completedTasks.map((t) => (
            <li key={t._id}>
              ✅ {t.title}{" "}
              <input
                type="checkbox"
                checked={t.completed}
                onChange={() => toggleTask(t)}
              />
            </li>
          ))}
        </ul>

        <h3>⏳ Not Completed Tasks</h3>
        <ul>
          {pendingTasks.map((t) => (
            <li key={t._id}>
              ⏳ {t.title}{" "}
              <input
                type="checkbox"
                checked={t.completed}
                onChange={() => toggleTask(t)}
              />
            </li>
          ))}
        </ul>

        <h3>📝 Tasks You Added</h3>
        <ul>
          {addedByUser.map((t) => (
            <li key={t._id}>
              {t.completed ? "✅" : "⏳"} {t.title}{" "}
              <input
                type="checkbox"
                checked={t.completed}
                onChange={() => toggleTask(t)}
              />
            </li>
          ))}
        </ul>
      </div>

      {/* ✅ Additional Charts */}
      <div style={styles.chartBox}>
        <h3>Mood Trend</h3>
        <Line
          data={{
            labels: moodLabels,
            datasets: [
              {
                label: "Mood Score",
                data: moodValues,
                borderColor: "#6A1B9A",
                tension: 0.3,
              },
            ],
          }}
        />
      </div>

      <div style={styles.chartBox}>
        <h3>Call Duration</h3>
        <Bar
          data={{
            labels: callLogs.map((c) =>
              new Date(c.startedAt).toLocaleDateString()
            ),
            datasets: [
              {
                label: "Minutes",
                backgroundColor: "#6A1B9A",
                data: callLogs.map((c) =>
                  Math.round((c.duration || 0) / 60)
                ),
              },
            ],
          }}
        />
      </div>
    </div>
  );
}

// ✅ STYLES
const styles = {
  page: {
    padding: "30px",
    minHeight: "100vh",
    background: "linear-gradient(135deg,#faf6ff,#ede7ff,#f5ebff)",
  },
  heading: {
    fontSize: "30px",
    marginBottom: "20px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
    gap: "20px",
    marginBottom: "30px",
  },
  card: {
    background: "white",
    padding: 20,
    borderRadius: 12,
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  },
  chartBoxSmall: {
    width: 260,
    background: "white",
    padding: 20,
    borderRadius: 12,
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    marginBottom: 30,
  },
  chartBox: {
    background: "white",
    padding: 25,
    marginTop: 30,
    borderRadius: 12,
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  },
  section: {
    marginTop: 40,
    padding: 20,
    background: "#fff",
    borderRadius: 12,
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  },
};

export default ProgressPage;
