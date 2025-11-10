import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';

// ✅ Added Landing Page
import LandingPage from './pages/LandingPage';

// Core Components
import AuthChecker from './components/AuthChecker';
import DashboardHome from './pages/DashboardHome';
import AIChatPage from './pages/AIChatPage';
import VolunteerPage from './pages/VolunteerPage';
import WellnessPage from './pages/WellnessPage';
import ResourcesPage from './pages/ResourcesPage';
import CommunityFeed from './pages/CommunityFeed';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SettingsPage from './pages/ProfilePage';
import ProgressPage from './pages/ProgressPage';
import FeedbackPage from './pages/FeedbackPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import VideoCallPage from './pages/VideoCallPage';
import ReelsViewer from './pages/ReelsViewer';
import ChatPage from './pages/ChatPage';
import ChatsPage from './pages/ChatsPage';

// 🎯 Community Chat
import CommunityChat from './pages/CommunityChat';
import GroupChatView from './pages/GroupChatView';

// ✅ Active Chat Page
import ActiveChatPage from './pages/ActiveChatPage';

function App() {
  return (
    <ThemeProvider>
      <Router future={{ v7_startTransition: true }}>
        <div className="App">
          <Routes>

            {/* ✅ ✅ NEW — PUBLIC LANDING PAGE AS HOME */}
            <Route path="/" element={<LandingPage />} />

            {/* ✅ LOGIN SYSTEM */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* ✅ AUTH CHECKER FOR LOGGED-IN USERS */}
            <Route path="/auth" element={<AuthChecker />} />

            {/* ✅ MAIN DASHBOARD */}
            <Route path="/dashboard" element={<DashboardHome />} />

            {/* ✅ COMMUNITY FEED & REELS */}
            <Route path="/feed" element={<CommunityFeed />} />
            <Route path="/reels" element={<ReelsViewer />} />

            {/* ✅ CHAT ROUTES */}
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/active-chat" element={<ChatPage />} />
            <Route path="/chat/:userId" element={<ChatPage />} />

            {/* ✅ WHATSAPP STYLE CHATS LIST */}
            <Route path="/active-chats" element={<ActiveChatPage />} />

            {/* ✅ COMMUNITY GROUP CHAT */}
            <Route path="/community" element={<CommunityChat />} />
            <Route path="/community/group/:groupId" element={<GroupChatView />} />

            {/* ✅ AI + WELLNESS + VOLUNTEER */}
            <Route path="/ai-chat" element={<AIChatPage />} />
            <Route path="/volunteers" element={<VolunteerPage />} />
            <Route path="/wellness" element={<WellnessPage />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/feedback" element={<FeedbackPage />} />
            <Route path="/video-call" element={<VideoCallPage />} />

            {/* ✅ OLD ROUTE REDIRECT */}
            <Route path="/volunteer-dashboard" element={<VolunteerPage />} />
            <Route path="/landing" element={<LandingPage />} />


            {/* ✅ DEFAULT FALLBACK */}
            <Route path="*" element={<h1>404 Not Found</h1>} />

          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
