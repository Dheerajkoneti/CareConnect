import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // useNavigate is essential here
import { useTheme } from '../context/ThemeContext';
import io from 'socket.io-client';
import { FaPaperPlane, FaChevronLeft, FaUsers, FaSmile, FaPaperclip, FaTimes } from 'react-icons/fa'; 

// Assuming the Socket.io server is running on port 5000
const socket = io('http://localhost:5000'); 

// --- LOCAL PERSISTENCE KEY ---
const MESSAGES_KEY = 'groupChatMessages'; 
const AI_SUGGESTION_KEY = 'wellnessAISent'; 

// --- AI BOT IDENTITY ---
const AI_BOT_ID = 'AI_WELLNESS_BOT';
const AI_BOT_NAME = 'Wellness AI Companion';

// --- AI SUGGESTION DATA ---
const WELLNESS_AI_SUGGESTION = {
    id: Date.now() + 1, 
    groupId: 'wellness',
    senderId: AI_BOT_ID,
    authorName: AI_BOT_NAME,
    content: "Welcome to your daily check-in! To get started, try the following tasks in your Wellness Tips page:\n\n1. Take a 5-minute 'Digital Detox' break.\n2. Practice 'Square Breathing' (4 seconds in, 4 hold, 4 out, 4 hold).\n3. Reflect on one positive thing that happened today.",
    type: 'text',
    createdAt: new Date().toISOString(),
};

// --- EMOJI DATA AND COMPONENT (UNCHANGED) ---
const EMOJIS = ['😀', '😂', '😍', '👍', '🙏', '🔥', '🎉', '💡', '💯', '❤️', '👀', '🥳', '🙌', '🌟', '😇', '🍕', '☕', '💻', '📚', '🎶', '🌍', '🏠', '🔑', '📞', '💡'];

const EmojiPicker = ({ onSelectEmoji, onClose, styles }) => (
    <div style={styles.emojiPickerContainer}>
        <div style={styles.emojiGrid}>
            {EMOJIS.map((emoji, index) => (
                <span key={index} onClick={() => onSelectEmoji(emoji)} style={styles.emojiButton}>{emoji}</span>
            ))}
        </div>
        <div style={styles.emojiCloseBar}>
            <FaTimes style={styles.emojiCloseIcon} onClick={onClose} />
        </div>
    </div>
);

// --- STYLES DEFINITIONS (UNCHANGED) ---
const baseStyles = {
    container: { display: 'flex', flexDirection: 'column', height: '100vh', flexGrow: 1, },
    header: { display: 'flex', alignItems: 'center', padding: '15px 20px', },
    backIcon: { fontSize: '20px', cursor: 'pointer', marginRight: '15px', },
    headerTitle: { margin: 0, fontSize: '18px', flexGrow: 1, display: 'flex', alignItems: 'center', },
    memberCount: { fontSize: '14px', },
    messagesContainer: { flexGrow: 1, overflowY: 'auto', padding: '20px 0', },
    inputWrapper: { padding: '10px 20px', display: 'flex', alignItems: 'center', position: 'relative' }, 
    chatInput: { flexGrow: 1, padding: '10px 15px', border: '1px solid #ccc', borderRadius: '20px', marginRight: '10px', outline: 'none', },
    sendButton: { width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', borderRadius: '50%', border: 'none', marginLeft: '5px', flexShrink: 0, },
    inputIcon: { fontSize: '20px', cursor: 'pointer', margin: '0 8px', },
    initialMessagePrompt: {
        textAlign: 'center', padding: '10px 20px', margin: '10px auto', borderRadius: '5px', maxWidth: '80%', fontStyle: 'italic', fontSize: '14px',
    },
    chatUserBubble: { borderRadius: '8px 8px 0 8px', maxWidth: '60%', padding: '8px 10px', display: 'flex', flexDirection: 'column', margin: '5px 15px', boxShadow: '0 1px 1px rgba(0,0,0,0.1)', whiteSpace: 'pre-wrap' },
    chatPartnerBubble: { borderRadius: '8px 8px 8px 0', maxWidth: '60%', padding: '8px 10px', display: 'flex', flexDirection: 'column', margin: '5px 15px', boxShadow: '0 1px 1px rgba(0,0,0,0.05)', whiteSpace: 'pre-wrap' },
    chatMessageText: { fontSize: '15px', },
    chatTimestamp: { fontSize: '10px', marginTop: '3px', alignSelf: 'flex-end', color: '#7F8C8D' },
    emojiPickerContainer: { position: 'absolute', bottom: '65px', left: '20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', width: '300px', padding: '10px', zIndex: 30, },
    emojiGrid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', maxHeight: '200px', overflowY: 'auto', },
    emojiButton: { fontSize: '24px', cursor: 'pointer', textAlign: 'center', padding: '5px', transition: 'background-color 0.1s', },
    emojiCloseBar: { borderTop: '1px solid #eee', marginTop: '10px', paddingTop: '5px', textAlign: 'right', },
    emojiCloseIcon: { color: '#7F8C8D', cursor: 'pointer', fontSize: '18px', },
};

const lightStyles = {
    ...baseStyles,
    header: { ...baseStyles.header, backgroundColor: '#FFFFFF', borderBottom: '1px solid #EAECEF', },
    backIcon: { ...baseStyles.backIcon, color: '#6A1B9A', },
    headerTitle: { ...baseStyles.headerTitle, color: '#2C3E50', },
    headerIconColor: '#6A1B9A',
    memberCount: { ...baseStyles.memberCount, color: '#7F8C8D', },
    messagesContainer: { ...baseStyles.messagesContainer, backgroundColor: '#F4F7F9', },
    initialMessagePrompt: { ...baseStyles.initialMessagePrompt, backgroundColor: '#FFFFFF', color: '#7F8C8D', },
    chatUserBubble: { ...baseStyles.chatUserBubble, backgroundColor: '#D9FDD3', color: '#111B21' }, 
    chatPartnerBubble: { ...baseStyles.chatPartnerBubble, backgroundColor: '#FFFFFF', color: '#111B21' },
    inputWrapper: { ...baseStyles.inputWrapper, backgroundColor: '#FFFFFF', borderTop: '1px solid #EAECEF', },
    chatInput: { ...baseStyles.chatInput, backgroundColor: '#F4F7F9', color: '#2C3E50', border: '1px solid #EAECEF', },
    sendButton: { ...baseStyles.sendButton, backgroundColor: '#3498DB', color: 'white', },
    inputIcon: { ...baseStyles.inputIcon, color: '#7F8C8D', },
};

const darkStyles = {
    ...baseStyles,
    header: { ...baseStyles.header, backgroundColor: '#212529', borderBottom: '1px solid #343A40', },
    backIcon: { ...baseStyles.backIcon, color: '#9B59B6', },
    headerTitle: { ...baseStyles.headerTitle, color: '#F8F9FA', },
    headerIconColor: '#9B59B6',
    memberCount: { ...baseStyles.memberCount, color: '#ADB5BD', },
    messagesContainer: { ...baseStyles.messagesContainer, backgroundColor: '#131920', },
    initialMessagePrompt: { ...baseStyles.initialMessagePrompt, backgroundColor: '#2A3942', color: '#CED4DA', },
    chatUserBubble: { ...baseStyles.chatUserBubble, backgroundColor: '#005C4B', color: '#F8F9FA' }, 
    chatPartnerBubble: { ...baseStyles.chatPartnerBubble, backgroundColor: '#2A3942', color: '#F8F9FA' },
    inputWrapper: { ...baseStyles.inputWrapper, backgroundColor: '#1E2429', borderTop: '1px solid #343A40', },
    chatInput: { ...baseStyles.chatInput, backgroundColor: '#2A3942', color: '#F8F9FA', border: '1px solid #343A40', },
    sendButton: { ...baseStyles.sendButton, backgroundColor: '#9B59B6', color: 'white', },
    inputIcon: { ...baseStyles.inputIcon, color: '#ADB5BD', },
    emojiPickerContainer: { ...baseStyles.emojiPickerContainer, backgroundColor: '#2A3942', border: '1px solid #34495E', boxShadow: '0 4px 12px rgba(0,0,0,0.6)' },
    emojiCloseBar: { ...baseStyles.emojiCloseBar, borderTop: '1px solid #34495E' }
};

// --- HELPER CHAT BUBBLE COMPONENT (MODIFIED to accept navigate) ---
const ChatBubble = ({ message, isSender, styles, navigate }) => {
    const author = isSender ? 'You' : message.authorName || 'User';
    const bubbleStyle = isSender ? styles.chatUserBubble : styles.chatPartnerBubble;
    
    const isAI = message.senderId === AI_BOT_ID;
    const authorColor = isAI ? '#3498DB' : (message.senderId === 'MOCK_MY_ID' ? '#00BFA5' : '#9B59B6');

    const finalBubbleStyle = isAI 
        ? {...bubbleStyle, backgroundColor: '#EAECEF', alignSelf: 'flex-start'} 
        : bubbleStyle;

    const renderContentWithLinks = (content) => {
        // Regex to find internal links like [click here](/wellness)
        const parts = content.split(/(\[.*?\]\([^)]*\))/g).filter(Boolean);
        
        return parts.map((part, index) => {
            const match = part.match(/\[(.*?)\]\(([^)]*)\)/);
            if (match) {
                const linkText = match[1];
                const path = match[2];
                
                return (
                    <a
                        key={index}
                        href={path}
                        onClick={(e) => {
                            e.preventDefault();
                            if (navigate && path) {
                                navigate(path);
                            }
                        }}
                        style={{ color: '#2980B9', textDecoration: 'underline', cursor: 'pointer' }}
                    >
                        {linkText}
                    </a>
                );
            }
            // For general text, we also wrap it in a span to apply the text style
            return <span key={index} style={styles.chatMessageText}>{part}</span>;
        });
    };

    return (
        <div style={{ ...finalBubbleStyle, alignSelf: isSender ? 'flex-end' : 'flex-start', margin: '5px 15px', padding: '8px 10px', }}>
            {(!isSender || isAI) && <span style={{fontSize: '12px', fontWeight: 'bold', color: authorColor, marginBottom: '2px'}}>{author}</span>}
            
            {/* Render content, now checking for internal links */}
            <span style={styles.chatMessageText}>{renderContentWithLinks(message.content)}</span>
            
            <span style={styles.chatTimestamp}>
                {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
        </div>
    );
};
// --- END HELPER COMPONENT ---

// 🎯 UPDATED: MOCK AI RESPONSE GENERATOR 🎯
const mockAIResponse = (userMessage) => {
    const lowerMsg = userMessage.toLowerCase();
    let content;

    if (lowerMsg.includes('open the task') || lowerMsg.includes('go to wellness')) {
        // Specific response with a clickable link
        content = "Ready to start? Click the **Wellness Tips** link in the left sidebar, or [click here to go there now](/wellness).";
    } else if (lowerMsg.includes('ok') || lowerMsg.includes('hey') || lowerMsg.includes('hello')) {
        content = "Hello! I recommend focusing on one of the initial three tasks mentioned above. Which one sounds like the best starting point for you right now?";
    } else if (lowerMsg.includes('task 1') || lowerMsg.includes('digital detox') || lowerMsg.includes('detox')) {
        content = "Great choice! The 5-minute Digital Detox is a simple way to reset. After you complete it, let me know how it changed your focus.";
    } else if (lowerMsg.includes('task 2') || lowerMsg.includes('square breathing') || lowerMsg.includes('breathing')) {
        content = "Task 2 is a powerful tool for stress relief. Find a quiet place, close your eyes, and follow the 4-second pattern. Report back on how grounded you feel!";
    } else if (lowerMsg.includes('task 3') || lowerMsg.includes('reflect') || lowerMsg.includes('positive thing')) {
        content = "Focusing on the positive builds resilience. What's one positive thing that happened today? Even a small victory counts!";
    } else if (lowerMsg.includes('feel') || lowerMsg.includes('sad') || lowerMsg.includes('stressed')) {
        content = "It sounds like you're having a tough moment. Task 2, the Square Breathing exercise, is excellent for immediate stress reduction. Would you like to try that now?";
    } else {
        content = "Thank you for sharing that. I recommend focusing on one of the initial three tasks mentioned above. Which one sounds like the best starting point for you right now?";
    }

    return {
        id: Date.now() + Math.random(),
        groupId: 'wellness',
        senderId: AI_BOT_ID,
        authorName: AI_BOT_NAME,
        content: content,
        type: 'text',
        createdAt: new Date().toISOString(),
    };
};


function GroupChatView() {
    const { groupId } = useParams();
    const navigate = useNavigate(); // Get the navigate function
    const { isDarkMode } = useTheme();
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null); 
    
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [myUserId] = useState(localStorage.getItem('userId') || 'MOCK_MY_ID');
    const [myName] = useState(localStorage.getItem('userName') || 'You');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false); 

    const groupName = groupId === 'general' ? "General Discussion" : (groupId === 'wellness' ? "Daily Wellness Check-in" : "Community Group");
    const memberCount = "100+"; 

    const themeStyles = isDarkMode ? darkStyles : lightStyles; 

    // --- HANDLERS (UNCHANGED) ---
    const handleEmojiToggle = () => setShowEmojiPicker(prev => !prev);
    const handleEmojiSelect = (emoji) => setInput(prev => prev + emoji);
    const handleFileAttachClick = () => { if (fileInputRef.current) { fileInputRef.current.click(); } };
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) { alert(`File selected for upload: ${file.name}`); }
    };
    const handleGoBack = () => navigate('/community');
    
    const handleSaveMessages = (newMessages) => {
        try {
            const storedData = localStorage.getItem(MESSAGES_KEY);
            const allGroupMessages = storedData ? JSON.parse(storedData) : {};
            allGroupMessages[groupId] = newMessages;
            localStorage.setItem(MESSAGES_KEY, JSON.stringify(allGroupMessages));
        } catch (error) {
            console.error("Error saving message to localStorage:", error);
        }
    };
    
    const handleSendMessage = (e) => {
        e.preventDefault();
        const text = input.trim();
        if (!text) return;

        const userMessageData = {
            id: Date.now(), groupId: groupId, senderId: myUserId, authorName: myName, content: text, type: 'text', createdAt: new Date().toISOString(),
        };

        setMessages(prev => {
            let newMessages = [...prev, userMessageData];
            
            if (groupId === 'wellness') {
                const aiReply = mockAIResponse(text);
                newMessages = [...newMessages, aiReply];
            }

            handleSaveMessages(newMessages); 
            socket.emit('send_group_message', userMessageData);
            
            if (groupId === 'wellness') {
                 setTimeout(() => {
                    socket.emit('send_group_message', newMessages[newMessages.length - 1]);
                 }, 1000); 
            }
            
            return newMessages;
        });
        setInput('');
    };

    // --- LOAD/REAL-TIME/SCROLL EFFECTS (UNCHANGED) ---
    useEffect(() => {
        // Load messages on mount
        try {
            const storedData = localStorage.getItem(MESSAGES_KEY);
            if (storedData) {
                const allGroupMessages = JSON.parse(storedData);
                const currentGroupMessages = allGroupMessages[groupId] || [];
                setMessages(currentGroupMessages);
            }
        } catch (error) {
            console.error("Error loading messages from localStorage:", error);
        }

        socket.on('receive_group_message', (message) => {
            if (message.groupId === groupId) {
                setMessages(prev => [...prev, message]);
            }
        });

        return () => { socket.off('receive_group_message'); };
    }, [groupId]); 

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);


    return (
        <div style={themeStyles.container}>
            {/* Header */}
            <div style={themeStyles.header}>
                <FaChevronLeft style={themeStyles.backIcon} onClick={handleGoBack} />
                <h2 style={themeStyles.headerTitle}>
                    <FaUsers style={{ marginRight: '8px', color: themeStyles.headerIconColor }} /> 
                    {groupName}
                </h2>
                <span style={themeStyles.memberCount}>{memberCount} Members</span>
            </div>

            {/* Message Area */}
            <div style={themeStyles.messagesContainer}>
                {messages.length === 0 && (
                    <div style={themeStyles.initialMessagePrompt}>
                        Welcome to the **{groupName}**! Start messaging here.
                    </div>
                )}
                
                {/* Render Messages, PASSING navigate PROP */}
                {messages.map((msg) => (
                    <ChatBubble 
                        key={msg.id}
                        message={msg}
                        isSender={msg.senderId === myUserId}
                        styles={themeStyles} 
                        navigate={navigate} // ⬅️ Passing navigate here
                    />
                ))}
                
                <div ref={messagesEndRef} />
            </div>

            {/* EMOJI PICKER RENDERING */}
            {showEmojiPicker && (
                <EmojiPicker onSelectEmoji={handleEmojiSelect} onClose={handleEmojiToggle} styles={themeStyles} />
            )}

            {/* Input Area */}
            <form onSubmit={handleSendMessage} style={themeStyles.inputWrapper}>
                
                <FaSmile style={{...themeStyles.inputIcon, color: showEmojiPicker ? themeStyles.headerIconColor : themeStyles.inputIcon.color}} onClick={handleEmojiToggle} />
                <FaPaperclip style={themeStyles.inputIcon} onClick={handleFileAttachClick} />
                
                <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{display: 'none'}} />

                <input 
                    type="text" 
                    placeholder="Type a community message..." 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    style={themeStyles.chatInput} 
                />
                <button type="submit" style={themeStyles.sendButton} disabled={!input.trim()}>
                    <FaPaperPlane size={20} />
                </button>
            </form>
        </div>
    );
}

export default GroupChatView;