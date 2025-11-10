// client/src/pages/DashboardHome.js (FINAL STABLE CODE)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar'; 
import axios from 'axios'; 

function DashboardHome() {
    const navigate = useNavigate();
    
    // Get dynamic user data
    const userName = localStorage.getItem('userName') || 'User'; 
    const [mood, setMood] = useState(3);
    const [latestPost, setLatestPost] = useState(null); 
    const [loadingPosts, setLoadingPosts] = useState(true); 
    const motivationalQuote = "Every new day is a chance to change your life. - Dalai Lama";
    const token = localStorage.getItem('token');

    // Security Check and Data Fetching
    useEffect(() => {
        if (!token) {
            navigate('/login');
        }

        const fetchLatestPost = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const response = await axios.get('/api/posts/latest', config);
                
                setLatestPost(response.data); 
            } catch (error) {
                console.error("Error fetching latest post:", error);
            }
            setLoadingPosts(false); 
        };

        fetchLatestPost();
        
    }, [navigate, token]);

    const handleMoodRecord = () => {
        alert(`Mood recorded as ${mood}! Thank you for checking in.`);
    };

    const moodStatus = (m) => {
        if (m >= 4) return "Fantastic! 😊";
        if (m === 3) return "Okay 🙂";
        return "Feeling down 😔";
    };
    
    // Data for the shortcut cards
    const shortcutData = [
        { icon: '🤖', title: 'Talk to AI Companion', path: '/ai-chat', color: '#673AB7' },
        { icon: '💬', title: 'Chat with Volunteer', path: '/volunteers', color: '#3498DB' },
        { icon: '🌿', title: 'Wellness Tips', path: '/wellness', color: '#4CAF50' },
        { icon: '🌍', title: 'Community Resources', path: '/resources', color: '#FFC107' },
        { icon: '📢', title: 'Community Feed', path: '/feed', color: '#E74C3C' },
    ];
    
    // Helper function to render a summary of the post
    const renderLatestUpdate = (post) => {
        if (!post) return <p style={styles.latestUpdateText}>No recent community updates. Be the first to post!</p>;

        const sender = post.user?.email.split('@')[0] || 'A member';
        let summary = post.content ? post.content.substring(0, 70) + '...' : 'Shared media.';
        
        if (post.mediaType === 'image') {
            summary = `Shared a photo: ${post.content || ''}`;
        } else if (post.mediaType === 'video') {
            summary = `Shared a video: ${post.content || ''}`;
        }

        return (
            <div style={styles.latestUpdateCard} onClick={() => navigate('/feed')}>
                <div style={styles.updateHeader}>
                    {post.mediaType !== 'none' && <span style={{marginRight: '10px'}}>{post.mediaType === 'image' ? '🖼️' : '🎬'}</span>}
                    <p style={styles.updateSender}>Latest post by **{sender}**</p>
                </div>
                <p style={styles.updateSummary}>{summary}</p>
                <span style={styles.updateLink}>View Full Feed →</span>
            </div>
        );
    };


    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            {/* 1. Sidebar Component (The source of all navigation) */}
            <Sidebar /> 

            {/* 2. Main Content Area */}
            <div style={styles.contentArea}>
                
                <header style={styles.header}>
                    <h1 style={styles.welcomeTitle}>Hi {userName}, how are you feeling today?</h1>
                    <button onClick={() => navigate('/settings')} style={styles.profileButton}>⚙️ Profile</button>
                </header>

                {/* Latest Community Update Section */}
                <h2 style={styles.updateTitle}>Community Snapshot</h2>
                {loadingPosts ? (
                    <p style={styles.loadingText}>Loading latest update...</p>
                ) : (
                    renderLatestUpdate(latestPost)
                )}
                <div style={{height: '1px', backgroundColor: '#ddd', margin: '30px 0'}}></div>


                {/* Quick Mood Check-in Card */}
                <div style={styles.moodCheckinBox}>
                    <h3 style={styles.checkinHeader}>Quick Mood Check-in 🌟</h3>
                    <div style={styles.moodControls}>
                        <input 
                            type="range" 
                            min="1" max="5" 
                            value={mood} 
                            onChange={(e) => setMood(e.target.value)}
                            style={styles.moodSlider}
                        />
                        <p style={styles.moodStatusText}>Status: **{moodStatus(mood)}**</p>
                    </div>
                    <button onClick={handleMoodRecord} style={styles.recordButton}>Record Mood</button>
                </div>
                
                {/* Daily Quote and Shortcuts */}
                <h2 style={styles.shortcutTitle}>Main Features</h2>
                <p style={styles.quoteText}>"{motivationalQuote}"</p>
                <div style={styles.shortcutsGrid}>
                    {shortcutData.map((item, index) => (
                        <div 
                            key={index}
                            style={{ ...styles.shortcutCard, borderBottom: `4px solid ${item.color}` }}
                            onClick={() => navigate(item.path)}
                        >
                            <div style={{ fontSize: '30px', marginBottom: '10px' }}>{item.icon}</div>
                            <div style={styles.cardTitle}>{item.title}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

const styles = {
    contentArea: { flexGrow: 1, padding: '40px 30px', backgroundColor: '#f0f0f5', overflowY: 'auto' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
    welcomeTitle: { fontSize: '32px', color: '#2c3e50', fontWeight: '700' },
    profileButton: { padding: '10px 15px', backgroundColor: '#673AB7', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
    
    // --- New Update Section Styles ---
    updateTitle: { fontSize: '24px', color: '#2c3e50', marginBottom: '15px', textAlign: 'left' },
    latestUpdateCard: {
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid #ddd',
        boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'transform 0.2s',
        '&:hover': { transform: 'translateY(-2px)' }
    },
    updateHeader: { display: 'flex', alignItems: 'center', marginBottom: '10px' },
    updateSender: { fontWeight: '600', color: '#6A1B9A', fontSize: '16px', margin: 0 },
    updateSummary: { fontSize: '14px', color: '#555', marginBottom: '10px' },
    updateLink: { fontSize: '12px', color: '#3498DB', fontWeight: 'bold' },
    latestUpdateText: { fontSize: '16px', color: '#777', padding: '20px', textAlign: 'center' },
    loadingText: { textAlign: 'center', color: '#777' },

    // --- Existing Styles ---
    quoteBox: { backgroundColor: '#FFFFFF', borderLeft: '5px solid #FFC107', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', marginBottom: '30px' },
    quoteText: { fontStyle: 'italic', color: '#555', fontSize: '16px', margin: 0 },
    moodCheckinBox: { backgroundColor: '#FFFFFF', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', marginBottom: '40px' },
    checkinHeader: { fontSize: '22px', color: '#6A1B9A', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '20px' },
    moodControls: { display: 'flex', alignItems: 'center', gap: '20px', marginTop: '10px' },
    moodSlider: { flexGrow: 1, height: '8px', WebkitAppearance: 'none', appearance: 'none', background: '#ccc', borderRadius: '4px' },
    moodStatusText: { fontWeight: 'bold', color: '#444' },
    recordButton: { marginTop: '20px', padding: '12px 25px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
    shortcutTitle: { fontSize: '24px', color: '#2c3e50', marginBottom: '20px', textAlign: 'left' },
    shortcutsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px' },
    shortcutCard: { padding: '20px', backgroundColor: 'white', borderRadius: '8px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', cursor: 'pointer', transition: 'transform 0.2s ease, box-shadow 0.2s ease', '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 6px 15px rgba(0,0,0,0.1)' } },
    cardTitle: { fontWeight: '600', color: '#333' }
};

export default DashboardHome;