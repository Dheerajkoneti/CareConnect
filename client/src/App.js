import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext'; 

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

// 🎯 COMMUNITY CHAT
import CommunityChat from './pages/CommunityChat'; 
import GroupChatView from './pages/GroupChatView'; 

// ✅ ✅ NEW — ACTIVE CHAT PAGE (YOUR FILE)
import ActiveChatPage from "./pages/ActiveChatPage";


function App() {
  return (
    <ThemeProvider> 
      <Router future={{ v7_startTransition: true }}> 
        <div className="App">
          <Routes>

            {/* 1️⃣ ENTRY POINT */}
            <Route path="/" element={<AuthChecker />} /> 
            
            {/* 2️⃣ PUBLIC ROUTES */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* 3️⃣ PROTECTED ROUTES */}
            <Route path="/dashboard" element={<DashboardHome />} />

            {/* COMMUNITY FEED & REELS */}
            <Route path="/feed" element={<CommunityFeed />} />
            <Route path="/reels" element={<ReelsViewer />} /> 
            
            {/* CHATS */}
            <Route path="/chat" element={<ChatPage />} /> 
            <Route path="/active-chat" element={<ChatPage />} /> 
            <Route path="/chat/:userId" element={<ChatPage />} /> 

            {/* ✅ ✅ NEW — WHATSAPP STYLE PERSONAL CHAT LIST */}
            <Route path="/active-chats" element={<ActiveChatPage />} />

            {/* 🎯 COMMUNITY CHAT (Group Messaging) */}
            <Route path="/community" element={<CommunityChat />} /> 
            <Route path="/community/group/:groupId" element={<GroupChatView />} />

            {/* AI + WELLNESS + VOLUNTEER */}
            <Route path="/ai-chat" element={<AIChatPage />} />
            <Route path="/volunteers" element={<VolunteerPage />} /> 
            <Route path="/wellness" element={<WellnessPage />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/feedback" element={<FeedbackPage />} />
            <Route path="/video-call" element={<VideoCallPage />} /> 

            {/* 4️⃣ REDIRECT OLD ROUTES */}
            <Route path="/volunteer-dashboard" element={<VolunteerPage />} />

            {/* 5️⃣ FALLBACK */}
            <Route path="*" element={<h1>404 Not Found</h1>} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
