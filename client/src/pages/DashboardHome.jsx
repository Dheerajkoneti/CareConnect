import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { useTheme } from "../context/ThemeContext";
// import axios from "axios"; // Optional – can re-enable later

function DashboardHome() {
  const { isDarkMode } = useTheme();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🧩 TEMP FIX: Disabled API call to avoid 404 errors
  // Commented out fetchLatestPosts (to silence errors until backend /api/posts route is ready)
  /*
  const fetchLatestPosts = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/posts/latest");
      setPosts(res.data);
    } catch (error) {
      console.error("Error fetching latest posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLatestPosts();
  }, []);
  */

  // Temporary static content for UI testing
  const demoPosts = [
    { id: 1, title: "Welcome to Chayo!", content: "Your emotional wellness journey starts here 💜" },
    { id: 2, title: "Volunteer Support Active", content: "Real-time connection with community mentors now available." },
    { id: 3, title: "Community Feed", content: "Join our live group discussions and share your experiences!" },
  ];

  const themeStyles = {
    page: {
      display: "flex",
      minHeight: "100vh",
      backgroundColor: isDarkMode ? "#131920" : "#F4F7F9",
      color: isDarkMode ? "#E0E0E0" : "#2C3E50",
    },
    content: {
      flexGrow: 1,
      padding: "40px",
    },
    header: {
      fontSize: "28px",
      fontWeight: "bold",
      color: "#6A1B9A",
      marginBottom: "10px",
    },
    subHeader: {
      fontSize: "16px",
      color: isDarkMode ? "#ADB5BD" : "#7F8C8D",
      marginBottom: "25px",
    },
    postCard: {
      backgroundColor: isDarkMode ? "#2A2F33" : "white",
      borderRadius: "10px",
      padding: "20px",
      boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
      marginBottom: "15px",
    },
    postTitle: {
      fontSize: "18px",
      fontWeight: "bold",
      color: isDarkMode ? "#EDEDED" : "#2C3E50",
    },
    postContent: {
      fontSize: "15px",
      color: isDarkMode ? "#B0B0B0" : "#7F8C8D",
      marginTop: "8px",
    },
  };

  return (
    <div style={themeStyles.page}>
      <Sidebar />

      <div style={themeStyles.content}>
        <h1 style={themeStyles.header}>Dashboard Home</h1>
        <p style={themeStyles.subHeader}>
          Welcome to your Chayo Dashboard — stay connected, informed, and supported.
        </p>

        {/* Static Demo Posts (displayed while backend is disabled) */}
        {loading ? (
          <p>Loading content...</p>
        ) : (
          demoPosts.map((post) => (
            <div key={post.id} style={themeStyles.postCard}>
              <h3 style={themeStyles.postTitle}>{post.title}</h3>
              <p style={themeStyles.postContent}>{post.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default DashboardHome;
