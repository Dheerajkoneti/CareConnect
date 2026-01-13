import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import socket from "./utils/socket";

// 🔔 GLOBAL INCOMING CALL LISTENER
import IncomingCallListener from "./components/IncomingCallListener";

// Pages
import AuthChecker from "./components/AuthChecker";
import DashboardHome from "./pages/DashboardHome";
import AIChatPage from "./pages/AIChatPage";
import VolunteerPage from "./pages/VolunteerPage";
import WellnessPage from "./pages/WellnessPage";
import ResourcesPage from "./pages/ResourcesPage";
import CommunityFeed from "./pages/CommunityFeed";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import SettingsPage from "./pages/ProfilePage";
import ProgressPage from "./pages/ProgressPage";
import FeedbackPage from "./pages/FeedbackPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import VideoCallPage from "./pages/VideoCallPage";
import ReelsViewer from "./pages/ReelsViewer";
import ChatPage from "./pages/ChatPage";
import CommunityChat from "./pages/CommunityChat";
import GroupChatView from "./pages/GroupChatView";
import ActiveChatPage from "./pages/ActiveChatPage";
import LandingPage from "./pages/LandingPage";
import VoiceCallPage from "./pages/VoiceCallPage";
import NotificationsPage from "./pages/NotificationsPage";
import CallHistoryPage from "./pages/CallHistoryPage";

function App() {

  // 🌍 REGISTER USER WITH SOCKET (CRITICAL)
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      socket.emit("register-user", userId);
      console.log("🌍 GLOBAL socket registered:", userId);
    }
  }, []);

  return (
    <ThemeProvider>

      {/* 🔔 MUST BE GLOBAL */}
      <IncomingCallListener />

      <Routes>

        <Route path="/" element={<AuthChecker />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        <Route path="/dashboard" element={<DashboardHome />} />
        <Route path="/feed" element={<CommunityFeed />} />
        <Route path="/reels" element={<ReelsViewer />} />
        <Route path="/community" element={<CommunityChat />} />
        <Route path="/community/group/:groupId" element={<GroupChatView />} />

        <Route path="/chat" element={<ChatPage />} />
        <Route path="/chat/:userId" element={<ChatPage />} />
        <Route path="/active-chats" element={<ActiveChatPage />} />

        <Route path="/ai-chat" element={<AIChatPage />} />
        <Route path="/volunteers" element={<VolunteerPage />} />
        <Route path="/wellness" element={<WellnessPage />} />
        <Route path="/resources" element={<ResourcesPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/progress" element={<ProgressPage />} />
        <Route path="/feedback" element={<FeedbackPage />} />

        {/* 📞 CALLS */}
        <Route path="/video-call/:roomId" element={<VideoCallPage />} />
        <Route path="/voice-call" element={<VoiceCallPage />} />
        <Route path="/video-call" element={<VideoCallPage />} />

        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/call-history" element={<CallHistoryPage />} />

        <Route path="*" element={<h1>404 Not Found</h1>} />

      </Routes>
    </ThemeProvider>
  );
}

export default App;