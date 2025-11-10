import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import { FaUserCircle, FaRobot, FaChevronRight, FaCircle, FaMusic } from 'react-icons/fa';

const API_BASE_URL = 'http://localhost:5000/api';

const AI_CHAT_ENTRY = { 
    id: 'AI_COMPANION', 
    name: 'AI Companion', 
    icon: <FaRobot style={{color: '#6A1B9A'}} />, 
    role: 'ai', 
    // Use a large future date to ensure the AI chat is always on top (or always use its hardcoded position)
    lastMessage: 'Ask me anything about wellness.', 
    lastTime: new Date(Date.now() + 999999999) 
};


const formatChatTime = (dateString) => {
    if (!dateString) return ''; // Handle null/undefined time for new chats
    const date = new Date(dateString);
    const now = new Date();
    
    if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'numeric', day: 'numeric' });
};


function ChatsPage() {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const currentUserId = localStorage.getItem('userId');
    
    const [chatList, setChatList] = useState([AI_CHAT_ENTRY]); 
    const [loading, setLoading] = useState(true);
    
    
    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }

        const fetchUsersForChat = async () => {
            setLoading(true);
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const response = await axios.get(`${API_BASE_URL}/users/all`, config); 
                
                const userProfiles = response.data
                    .filter(user => user._id !== currentUserId && user.email)
                    .map(user => ({
                        id: user._id,
                        name: user.username 
                            || user.name
                            || user.email.split('@')[0],
                        email: user.email,
                        icon: <FaUserCircle style={{color: '#3498DB'}} />,
                        role: user.role,
                        
                        // ✨ UPDATED: Use actual data from the backend aggregation ✨
                        lastMessage: user.lastMessage || `Start chatting with ${user.username || user.name || 'User'}!`, 
                        lastTime: user.lastTime || new Date(0), // Use actual time, fallback to epoch if no message
                        
                        unread: (user.role === 'volunteer') ? 0 : 1, // Keep mock for unread status
                    }));
                
                // Sort the entire list, including the AI entry, to ensure true newest-first ordering.
                const finalChatList = [AI_CHAT_ENTRY, ...userProfiles];
                
                // Sort by lastTime descending (newest first). AI is guaranteed to be first due to its large mock lastTime.
                finalChatList.sort((a, b) => new Date(b.lastTime).getTime() - new Date(a.lastTime).getTime());
                
                setChatList(finalChatList);
                
            } catch (error) {
                console.error("Error fetching user list for chat:", error);
                setChatList([AI_CHAT_ENTRY]);
            } finally {
                setLoading(false);
            }
        };
        fetchUsersForChat();
    }, [navigate, token, currentUserId]);


    if (!token) return null;

    const handleChatClick = (chatId) => {
        navigate(`/chat/${chatId}`);
    };

    if (loading) {
        return (
            <div style={styles.container}>
                <Sidebar />
                <h1 style={{ padding: '40px', color: '#6A1B9A' }}>Loading Chats...</h1>
            </div>
        );
    }

    // ... (rest of the component JSX and styles remain the same)
    return (
        <div style={styles.container}>
            <Sidebar />
            <div style={styles.contentArea}>
                <h1 style={styles.pageHeader}>Active Conversations</h1>
                <p style={styles.pageSubtitle}>Select a chat to continue your conversation.</p>
                
                <div style={styles.searchBar}>
                    <input type="text" placeholder="Search messages or contacts..." style={styles.searchInput} />
                </div>

                <div style={styles.chatListContainer}>
                    {chatList.map((chat) => {
                        const key = chat.id || chat._id; 
                        const isUnread = chat.unread > 0;
                        const timeString = formatChatTime(chat.lastTime);

                        return (
                            <div 
                                key={key} 
                                style={styles.chatCard}
                                onClick={() => handleChatClick(chat.id)}
                            >
                                {/* AVATAR AREA */}
                                <div style={{
                                    ...styles.chatIconWrapper, 
                                    border: isUnread ? '2px solid #6A1B9A' : 'none'
                                }}>
                                    {chat.icon}
                                </div>

                                {/* DETAILS (Name and Message Summary) */}
                                <div style={styles.chatDetails}>
                                    <div style={styles.chatName}>
                                        {chat.name}
                                    </div>
                                    <div style={{
                                        ...styles.lastMessage, 
                                        color: isUnread ? '#2C3E50' : '#7F8C8D',
                                        fontWeight: isUnread ? '600' : 'normal'
                                    }}>
                                        {chat.lastMessage}
                                    </div>
                                </div>

                                {/* TIME AND STATUS/UNREAD DOT */}
                                <div style={styles.chatTimeWrapper}>
                                    <span style={{...styles.chatTime, color: isUnread ? '#6A1B9A' : '#999'}}>
                                        {timeString}
                                    </span>
                                    {isUnread && (
                                        <FaCircle style={styles.unreadCount} />
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: { display: 'flex', minHeight: '100vh', backgroundColor: '#F8F9FA' },
    contentArea: { flexGrow: 1, padding: '40px 30px', maxWidth: '600px', margin: '0 auto' },
    pageHeader: { fontSize: '30px', color: '#6A1B9A', marginBottom: '5px', fontWeight: '800' },
    pageSubtitle: { fontSize: '16px', color: '#7F8C8D', marginBottom: '30px' },
    
    // Search Bar Styles
    searchBar: { marginBottom: '20px' },
    searchInput: {
        width: '100%',
        padding: '12px 15px',
        borderRadius: '25px',
        border: '1px solid #D9E0E7',
        fontSize: '16px',
        outline: 'none',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    },

    // Chat List Styles
    chatListContainer: { display: 'flex', flexDirection: 'column', gap: '1px', border: '1px solid #EAEAEA', borderRadius: '10px', overflow: 'hidden' },
    chatCard: {
        display: 'flex',
        alignItems: 'center',
        padding: '15px',
        backgroundColor: 'white',
        borderBottom: '1px solid #F0F0F0',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        '&:hover': { backgroundColor: '#F0F3F7' },
    },
    chatIconWrapper: { 
        fontSize: '32px', 
        color: '#6A1B9A', 
        marginRight: '15px',
        width: '45px',
        height: '45px',
        borderRadius: '50%',
        backgroundColor: '#E9ECEF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
    },
    chatDetails: { flexGrow: 1, overflow: 'hidden' },
    chatName: { fontWeight: 'bold', fontSize: '16px', color: '#2C3E50', marginBottom: '2px' },
    lastMessage: { 
        fontSize: '14px', 
        color: '#7F8C8D', 
        overflow: 'hidden', 
        whiteSpace: 'nowrap', 
        textOverflow: 'ellipsis', 
        maxWidth: '100%' 
    },
    chatTimeWrapper: { 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'flex-end', 
        gap: '5px',
        minWidth: '60px' 
    },
    chatTime: { fontSize: '12px', color: '#999' },
    unreadCount: {
        fontSize: '10px',
        color: '#6A1B9A',
        backgroundColor: 'transparent',
    },
};

export default ChatsPage;