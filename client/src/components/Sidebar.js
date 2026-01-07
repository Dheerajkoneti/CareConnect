// client/src/components/Sidebar.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaPhoneAlt } from "react-icons/fa";
import {
  FaComments,
  FaChartLine,
  FaGlobe,
  FaRunning,
  FaVideo,
  FaHome,
  FaRobot,
  FaCog,
  FaSignOutAlt,
  FaUsers,
  FaHandHoldingHeart,
  FaBars,
  FaTimes
} from 'react-icons/fa';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Sidebar toggle
  const [isOpen, setIsOpen] = useState(true);

  // Live user data
  const [userName, setUserName] = useState(localStorage.getItem("userName") || "Guest");
  const [role, setRole] = useState(localStorage.getItem("role") || "community_member");

  // Auto-update if user logs in or registers
  useEffect(() => {
    const syncUser = () => {
      setUserName(localStorage.getItem("userName") || "Guest");
      setRole(localStorage.getItem("role") || "community_member");
    };
    window.addEventListener("storage", syncUser);
    return () => window.removeEventListener("storage", syncUser);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    alert('You have been logged out.');
    navigate('/login');
  };

  const menuItems = [
    { name: "Dashboard Home", path: "/dashboard", icon: FaHome },
    { name: "Active Chats", path: "/active-chats", icon: FaComments },
    { name: "Community Feed", path: "/feed", icon: FaRunning, iconStyle: { transform: 'scaleX(-1)' } },
    { name: "Community Chat", path: "/community", icon: FaUsers },
    { name: "AI Companion Chat", path: "/ai-chat", icon: FaRobot },
    { name: "Volunteer Support", path: "/volunteers", icon: FaHandHoldingHeart },
    { name: "Voice Call", path: "/voice-call", icon: FaPhoneAlt },
    { name: "Video Call (Test)", path: "/video-call", icon: FaVideo },
    {
      name: "Wellness Tips",
      path: "/wellness",
      emoji: "🌿"
    },
    { name: "Community Resources", path: "/resources", icon: FaGlobe },
    { name: "Progress & Insights", path: "/progress", icon: FaChartLine },
  ];

  const highlightColor = '#3498DB';

  // ✅ FIXED ICON RENDERER
  const renderIcon = (item) => {
    if (item.emoji) {
      return (
        <span style={{ fontSize: '16px', marginRight: isOpen ? '10px' : '0' }}>
          {item.emoji}
        </span>
      );
    }

    const IconComponent = item.icon;
    return (
      <IconComponent style={{ ...styles.icon, ...item.iconStyle }} />
    );
  };

  return (
    <div style={styles.layout}>
      {/* Toggle Button */}
      <div style={styles.toggleButton} onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <FaTimes /> : <FaBars />}
      </div>

      {/* Sidebar */}
      <div
        style={{
          ...styles.sidebar,
          width: isOpen ? '250px' : '70px',
          transition: 'width 0.3s ease-in-out',
        }}
      >
        <div style={styles.header}>
          <h2 style={{ ...styles.welcome, opacity: isOpen ? 1 : 0 }}>
            Welcome, <br />
            <strong>{userName}</strong>
          </h2>
          <p style={{ ...styles.userRoleText, opacity: isOpen ? 1 : 0 }}>
            Role: <strong>{role}</strong>
          </p>
        </div>

        {/* Menu */}
        <div style={styles.menuContainer}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const activeBg = '#3D5A73';

            return (
              <div
                key={item.name}
                style={{
                  ...styles.menuItem,
                  color: isActive ? '#FFFFFF' : '#ECF0F1',
                  backgroundColor: isActive ? activeBg : 'transparent',
                  borderLeft: isActive ? `5px solid ${highlightColor}` : '5px solid transparent',
                  justifyContent: isOpen ? 'flex-start' : 'center',
                }}
                onClick={() => navigate(item.path)}
                title={item.name}
              >
                {renderIcon(item)}
                {isOpen && <span>{item.name}</span>}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <div style={styles.footerSeparator}></div>

          <div
            onClick={() => navigate('/settings')}
            style={{ ...styles.footerItem, justifyContent: isOpen ? 'flex-start' : 'center' }}
          >
            <FaCog style={styles.icon} /> {isOpen && 'Profile & Settings'}
          </div>

          <button onClick={handleLogout} style={styles.logoutButton}>
            <FaSignOutAlt style={{ marginRight: isOpen ? '8px' : '0' }} />
            {isOpen && 'Logout'}
          </button>
        </div>
      </div>
    </div>
  );
};

// 🎨 Styles (UNCHANGED)
const styles = {
  layout: {
    display: 'flex',
    height: '100vh',
  },
  sidebar: {
    backgroundColor: '#2C3E50',
    color: '#ECF0F1',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '4px 0 15px rgba(0,0,0,0.4)',
    zIndex: 10,
    position: 'relative',
  },
  toggleButton: {
    position: 'fixed',
    top: '15px',
    left: '15px',
    zIndex: 100,
    backgroundColor: '#6A1B9A',
    color: 'white',
    padding: '8px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '18px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
  },
  header: {
    padding: '20px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  },
  welcome: {
    fontSize: '16px',
    marginBottom: '4px',
    transition: 'opacity 0.3s',
  },
  userRoleText: {
    fontSize: '14px',
    color: '#BDC3C7',
    transition: 'opacity 0.3s',
  },
  icon: {
    marginRight: '10px',
    fontSize: '16px',
    color: '#3498DB',
  },
  menuContainer: {
    flexGrow: 1,
    overflowY: 'auto',
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 15px',
    fontSize: '15px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
  },
  footer: {
    marginTop: 'auto',
    padding: '10px 15px 20px',
  },
  footerSeparator: {
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    width: '100%',
    marginBottom: '15px',
  },
  footerItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 0',
    fontSize: '14px',
    color: '#ECF0F1',
    cursor: 'pointer',
  },
  logoutButton: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#E74C3C',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '10px',
  },
};

export default Sidebar;
