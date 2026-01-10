import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import socket from "../utils/socket";
import { 
    FaPaperPlane, FaSmile, FaMicrophone, FaPaperclip, FaVideo, FaEllipsisV, FaSearch, 
    FaChevronLeft, FaCheck, FaTimes, FaStop, FaPlay, FaPause, FaTrashAlt, FaLock 
} from 'react-icons/fa'; 

// Assuming the Socket.io server is running on port 5000

// --- EMOJI DATA AND COMPONENT (UNCHANGED) ---
const EMOJIS = ['😀', '😂', '😍', '👍', '🙏', '🔥', '🎉', '💡', '💯', '❤️', '👀', '🥳', '🙌', '🌟', '😇', '🍕', '☕', '💻', '📚', '🎶', '🌍', '🏠', '🔑', '📞', '💡'];

const EmojiPicker = ({ onSelectEmoji, onClose }) => (
    <div style={styles.emojiPickerContainer}>
        <div style={styles.emojiGrid}>
            {EMOJIS.map((emoji, index) => (
                <span 
                    key={index} 
                    onClick={() => onSelectEmoji(emoji)} 
                    style={styles.emojiButton}
                >
                    {emoji}
                </span>
            ))}
        </div>
        <div style={styles.emojiCloseBar}>
            <FaTimes style={styles.emojiCloseIcon} onClick={onClose} />
        </div>
    </div>
);
// --- END EMOJI COMPONENT ---

// --- Helper Functions and Components (UNCHANGED) ---
const MessageStatusIcon = ({ status }) => {
    const iconStyle = { marginLeft: '5px', fontSize: '10px', verticalAlign: 'middle' };
    switch (status) {
        case 'sent':
            return <FaCheck style={{ ...iconStyle, color: '#7F8C8D' }} />; 
        case 'delivered':
            return (<span style={{ position: 'relative', display: 'inline-block' }}><FaCheck style={{ ...iconStyle, position: 'absolute', right: 0, color: '#7F8C8D' }} /><FaCheck style={{ ...iconStyle, marginRight: 0, color: '#7F8C8D' }} /></span>);
        case 'read':
            return (<span style={{ position: 'relative', display: 'inline-block' }}><FaCheck style={{ ...iconStyle, position: 'absolute', right: 0, color: '#3498DB' }} /><FaCheck style={{ ...iconStyle, marginRight: 0, color: '#3498DB' }} /></span>);
        default:
            return null;
    }
};

const FileBubble = ({ message, styles }) => (
    <div style={styles.fileContainer}>
        <div style={styles.fileIcon}>W</div>
        <div style={styles.fileInfo}>
            <p style={styles.fileName}>{message.fileName}</p>
            <p style={styles.fileDetails}>{message.fileSize}</p>
        </div>
        <div style={styles.fileActions}>
            <button style={styles.fileActionButton} onClick={() => console.log(`Opening ${message.fileName}`)}>Open</button>
            <button style={{...styles.fileActionButton, marginLeft: '10px'}} onClick={() => console.log(`Downloading ${message.fileName}`)}>Save As...</button>
        </div>
    </div>
);

const AudioBubble = ({ message, styles }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    return (
        <div style={styles.audioContainer}>
            <button 
                style={styles.audioPlayButton} 
                onClick={() => setIsPlaying(!isPlaying)}
            >
                {isPlaying ? <FaPause size={10} /> : <FaPlay size={10} />}
            </button>
            <div style={styles.audioWaveform}>
                {/* Static waveform for playback remains here */}
                <div style={{...styles.waveformBar, height: '40%'}} /><div style={{...styles.waveformBar, height: '80%'}} /><div style={{...styles.waveformBar, height: '60%'}} /><div style={{...styles.waveformBar, height: '30%'}} />
            </div>
            <span style={styles.audioDuration}>{message.duration}</span>
        </div>
    );
};

const ChatBubble = ({ message, isSender, styles }) => {
    const ContentComponent = () => {
        if (message.type === 'file') { return <FileBubble message={message} styles={styles} />; }
        if (message.type === 'audio') { return <AudioBubble message={message} styles={styles} />; }
        return <span style={styles.chatMessageText}>{message.content}</span>;
    };

    return (
        <div style={{
            ...(isSender ? styles.chatUserBubble : styles.chatPartnerBubble),
            alignSelf: isSender ? 'flex-end' : 'flex-start',
            margin: '5px 15px', 
            padding: message.type !== 'text' ? '10px 10px 5px 10px' : '8px 10px',
        }}>
            <ContentComponent />
            <span style={styles.chatTimestamp}>
                {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                {isSender && <MessageStatusIcon status={message.status} />}
            </span>
        </div>
    );
};
// --- END Helper Functions and Components ---

function ChatPage() {
    const { userId: partnerId } = useParams(); 
    const navigate = useNavigate();
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null); 

    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [chatPartner, setChatPartner] = useState(null);
    const [myUserId] = useState(localStorage.getItem('userId') || 'MOCK_MY_ID');
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false); 
    const [isRecording, setIsRecording] = useState(false); 
    const [isPaused, setIsPaused] = useState(false); 
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false); 
    
    // --- NEW STATE FOR LIVE RECORDING SIMULATION ---
    const [recordingTime, setRecordingTime] = useState(0); 
    const [waveformHeights, setWaveformHeights] = useState(Array(20).fill('0%')); // Array of 20 bars
    // ------------------------------------------------

    const token = localStorage.getItem('token');

    // Scroll to bottom whenever messages update
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatMessages]);

    // Timer and Waveform Simulation Effect
    useEffect(() => {
        let timerId;
        if (isRecording && !isPaused) {
            timerId = setInterval(() => {
                setRecordingTime(prevTime => prevTime + 100); // Increment by 100ms
                
                // Simulate volume changes (random animation)
                setWaveformHeights(prevHeights => 
                    prevHeights.map((_, index) => {
                        // Keep a general trend but introduce randomness for a live look
                        const baseHeight = Math.floor(Math.random() * 60) + 20; // 20% to 80%
                        return `${baseHeight}%`;
                    })
                );
            }, 100); // Update every 100ms
        } else {
            clearInterval(timerId);
        }

        // Cleanup function
        return () => clearInterval(timerId);
    }, [isRecording, isPaused]);
    
    // Setup/Fetch Logic (UNCHANGED)
    useEffect(() => {
        if (!token) { navigate('/login'); return; }
        const partnerName = "Volunteer " + partnerId.substring(partnerId.length - 4);
        setChatPartner(prev => ({ ...prev, name: partnerName }));
        setChatMessages([]); 
    }, [navigate, partnerId, myUserId, token]);

    // Format the time (m:ss)
    const formatTime = (ms) => {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    // --- Voice Recording Logic (UPDATED) ---
    const handleVoiceRecord = () => {
        if (!isRecording) {
            setIsRecording(true);
            setIsPaused(false);
            setRecordingTime(0); // Reset timer on start
            console.log("Recording started.");
        } else {
            setIsPaused(prev => !prev);
            console.log(isPaused ? "Recording resumed." : "Recording paused.");
        }
    };
    
    const handleCancelRecord = () => {
        setIsRecording(false);
        setIsPaused(false);
        setRecordingTime(0);
        setWaveformHeights(Array(20).fill('0%')); // Reset waveform
        console.log("Recording canceled/deleted.");
    };
    
    const handleSendRecording = () => {
        const duration = formatTime(recordingTime);
        
        setIsRecording(false);
        setIsPaused(false);
        setRecordingTime(0);
        setWaveformHeights(Array(20).fill('0%')); // Reset waveform
        
        console.log(`Stopping and sending voice message with duration: ${duration}`);
        // Mock sending the message:
        setChatMessages(prev => [...prev, { 
            id: Date.now(), senderId: myUserId, content: "Voice Note", type: 'audio', duration: duration, createdAt: new Date().toISOString(), status: 'sent' 
        }]);
    };
    
    // File Upload Handlers (UNCHANGED)
    const handleFileUploadClick = () => { fileInputRef.current.click(); };
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setChatMessages(prev => [...prev, { 
                id: Date.now(), senderId: myUserId, content: `Sent file: ${file.name}`, type: 'file', fileName: file.name, fileSize: `${(file.size / 1024).toFixed(1)} KB, Document`, createdAt: new Date().toISOString(), status: 'sent' 
            }]);
        }
    };
    
    const handleChatSubmit = (e) => {
        e.preventDefault();
        if (!chatInput.trim()) return;
        const messageData = { id: Date.now(), senderId: myUserId, recipientId: partnerId, content: chatInput.trim(), type: 'text', createdAt: new Date().toISOString(), status: 'sent', };
        setChatMessages(prev => [...prev, messageData]);
        setChatInput('');
    };

    // Emoji Logic (UNCHANGED)
    const handleEmojiSelect = (emoji) => {
        setChatInput(prev => prev + emoji);
    };
    const handleEmojiToggle = () => {
        setShowEmojiPicker(prev => !prev);
    };
    
    const handleClearChat = () => {
        if (window.confirm("Are you sure you want to clear all messages in this chat?")) { setChatMessages([]); console.log("Chat cleared."); }
        setIsMenuOpen(false);
    };

    const filteredMessages = chatMessages.filter(message => 
        message.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const showSendButton = chatInput.trim().length > 0;

    const rightButtonAction = () => {
        if (showSendButton) return handleChatSubmit; 
        if (isRecording) return handleSendRecording; 
        return handleVoiceRecord; 
    };
    
    const rightButtonIcon = () => {
        if (showSendButton) return <FaPaperPlane size={18} style={{transform: 'rotate(15deg)'}} />;
        if (isRecording) return <FaPaperPlane size={18} style={{transform: 'rotate(15deg)'}} />; 
        return <FaMicrophone size={18} />;
    };
    
    if (!chatPartner) return (
        <div style={styles.container}>
            <Sidebar />
            <h1 style={{ padding: '40px' }}>Loading Chat...</h1>
        </div>
    );

    return (
        <div style={styles.container}>
            <Sidebar />
            
            <div style={styles.chatArea}>
                
                {/* Header Bar (UNCHANGED) */}
                <div style={styles.chatHeader}>
                    <div style={styles.headerPartnerInfo}>
                        <FaChevronLeft style={styles.backIcon} onClick={() => navigate('/chats')} />
                        <div style={styles.avatar}>D</div>
                        <div>
                            <h3 style={{margin: 0, fontSize: '18px'}}>{chatPartner.name}</h3>
                            <p style={styles.statusText}>online</p>
                        </div>
                    </div>
                    <div style={styles.headerActions}>
                        <FaSearch style={styles.actionIcon} onClick={() => setIsSearching(!isSearching)} />
                        <FaVideo style={styles.actionIcon} onClick={() => navigate('/video-call')} />
                        
                        <div style={{position: 'relative'}}>
                            <FaEllipsisV style={styles.actionIcon} onClick={() => setIsMenuOpen(!isMenuOpen)} />
                            {isMenuOpen && (
                                <div style={styles.dropdownMenu}>
                                    <div style={styles.menuItem} onClick={handleClearChat}>Clear Chat</div>
                                    <div style={styles.menuItem} onClick={() => alert('View Contact')}>View Contact</div>
                                    <div style={styles.menuItem} onClick={() => alert('Mute Notifications')}>Mute Notifications</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* Search Input Bar (UNCHANGED) */}
                {isSearching && (
                    <div style={styles.searchBar}>
                        <input
                            type="text"
                            placeholder="Search messages..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={styles.searchInput}
                        />
                        <FaTimes style={styles.searchCloseIcon} onClick={() => { setSearchTerm(''); setIsSearching(false); }} />
                    </div>
                )}


                {/* Messages Container (UNCHANGED) */}
                <div style={styles.messagesContainer}>
                    {filteredMessages.map((message) => (
                        <ChatBubble 
                            key={message.id || message.createdAt}
                            message={message}
                            isSender={message.senderId === myUserId}
                            styles={styles}
                        />
                    ))}
                    {filteredMessages.length === 0 && searchTerm && (
                        <p style={{textAlign: 'center', color: '#7F8C8D', padding: '20px'}}>No messages match "{searchTerm}".</p>
                    )}
                    {chatMessages.length === 0 && !searchTerm && (
                        <p style={styles.startChatPrompt}>Start a new conversation!</p>
                    )}
                    <div ref={messagesEndRef} /> 
                </div>

                {/* EMOJI PICKER DISPLAY (UNCHANGED) */}
                {showEmojiPicker && (
                    <EmojiPicker onSelectEmoji={handleEmojiSelect} onClose={handleEmojiToggle} />
                )}

                {/* FINAL INPUT BAR DESIGN (UPDATED) */}
                <div style={styles.finalInputBarContainer}>
                    
                    {/* 1. EMOJI ICON (Far Left - UNCHANGED) */}
                    <FaSmile 
                        style={{...styles.leftUtilityIcon, color: showEmojiPicker ? '#00BFA5' : '#7F8C8D'}} 
                        onClick={handleEmojiToggle} 
                    />
                    
                    {/* Input / Recording Display Area */}
                    <div style={styles.finalInputForm}>
                        
                        {isRecording ? (
                            // Recording UI: Trash, Status/Timer, Waveform, Pause/Resume
                            <div style={styles.recordingInterface}>
                                <button type="button" onClick={handleCancelRecord} style={styles.transparentButton}>
                                    <FaTrashAlt style={styles.trashIcon} />
                                </button>
                                
                                <span style={styles.recordStatus}>
                                    <span style={styles.recordDot} /> 
                                    {formatTime(recordingTime)} {/* DYNAMIC TIME */}
                                    <FaLock style={styles.lockIcon}/> 
                                </span>
                                
                                {/* DYNAMIC WAVEFORM SIMULATION */}
                                <div style={styles.recordingWaveform}>
                                    {waveformHeights.map((height, index) => (
                                        <div 
                                            key={index}
                                            style={{...styles.waveformBar, height: isPaused ? '0%' : height, backgroundColor: '#999'}} 
                                        />
                                    ))}
                                </div>
                                
                                {/* Pause/Resume button */}
                                <button type="button" onClick={handleVoiceRecord} style={styles.pauseButton}>
                                    {isPaused ? <FaMicrophone size={16} /> : <FaPause size={16} />}
                                </button>
                            </div>
                        ) : (
                            // Normal Input Mode (UNCHANGED)
                            <form onSubmit={handleChatSubmit} style={{width: '100%', display: 'flex', alignItems: 'center'}}>
                                <input
                                    type="text"
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    placeholder="Type a message..."
                                    style={styles.finalChatInput}
                                />
                                <FaPaperclip style={styles.clipIcon} onClick={handleFileUploadClick} />
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    onChange={handleFileChange} 
                                    style={{display: 'none'}} 
                                />
                            </form>
                        )}
                    </div>
                    
                    {/* 3. RIGHT BUTTON (Send or Mic/Send Recording) */}
                    <button 
                        type="button"
                        onClick={rightButtonAction()} 
                        style={styles.sendButton}
                        title={showSendButton ? "Send Message" : (isRecording ? "Send Recording" : "Start Voice Recording")}
                    >
                        {rightButtonIcon()}
                    </button>
                </div>
            </div>
        </div>
    );
}

// --- Styles Object (Updated with new recording waveform styles) ---
const styles = {
    // ... (Existing styles) ...
    container: { display: 'flex', width: '100vw', minHeight: '100vh', },
    chatArea: { flexGrow: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#F7F7F7', position: 'relative', },
    searchBar: { display: 'flex', padding: '10px 20px', backgroundColor: '#EAECEF', borderBottom: '1px solid #DCDCDC', alignItems: 'center', },
    searchInput: { flexGrow: 1, padding: '8px 15px', border: '1px solid #BDC3C7', borderRadius: '20px', outline: 'none', fontSize: '14px', },
    searchCloseIcon: { marginLeft: '10px', cursor: 'pointer', color: '#7F8C8D', fontSize: '20px', },
    chatHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px', backgroundColor: '#FFFFFF', borderBottom: '1px solid #EAECEF', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', zIndex: 10, },
    headerPartnerInfo: { display: 'flex', alignItems: 'center', gap: '10px', },
    avatar: { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#6A1B9A', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '18px', flexShrink: 0, },
    statusText: { margin: 0, fontSize: '12px', color: '#7F8C8D', },
    headerActions: { display: 'flex', gap: '20px', alignItems: 'center', },
    actionIcon: { color: '#6A1B9A', cursor: 'pointer', fontSize: '18px', },
    backIcon: { color: '#7F8C8D', cursor: 'pointer', fontSize: '20px', marginRight: '10px', },
    messagesContainer: { flexGrow: 1, overflowY: 'auto', padding: '10px 0', backgroundImage: 'linear-gradient(45deg, #F9F9F9 25%, transparent 25%), linear-gradient(-45deg, #F9F9F9 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #F9F9F9 75%), linear-gradient(-45deg, transparent 75%, #F9F9F9 75%)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px', },
    chatUserBubble: { backgroundColor: '#DCF8C6', padding: '8px 10px', borderRadius: '8px 8px 0 8px', maxWidth: '70%', boxShadow: '0 1px 1px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', textAlign: 'left', },
    chatPartnerBubble: { backgroundColor: '#FFFFFF', padding: '8px 10px', borderRadius: '8px 8px 8px 0', maxWidth: '70%', boxShadow: '0 1px 1px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', textAlign: 'left', },
    chatMessageText: { fontSize: '15px', color: '#2C3E50', },
    chatTimestamp: { fontSize: '10px', color: '#7F8C8D', marginTop: '3px', alignSelf: 'flex-end', whiteSpace: 'nowrap', },
    finalInputBarContainer: { display: 'flex', alignItems: 'center', padding: '5px 20px', backgroundColor: '#F7F7F7', borderTop: '1px solid #EAECEF', },
    leftUtilityIcon: { color: '#7F8C8D', cursor: 'pointer', fontSize: '24px', marginRight: '15px', flexShrink: 0, },
    finalInputForm: { flexGrow: 1, display: 'flex', position: 'relative', backgroundColor: 'white', borderRadius: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', height: '45px', alignItems: 'center', paddingLeft: '15px', },
    finalChatInput: { flexGrow: 1, padding: '10px 0', border: 'none', outline: 'none', fontSize: '16px', backgroundColor: 'transparent', height: '45px', boxSizing: 'border-box', },
    clipIcon: { color: '#7F8C8D', cursor: 'pointer', fontSize: '22px', padding: '0 10px 0 5px', flexShrink: 0, },
    sendButton: { backgroundColor: '#00BFA5', color: 'white', border: 'none', borderRadius: '50%', width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginLeft: '10px', flexShrink: 0, boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)', },
    recordingInterface: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 10px', backgroundColor: 'white', borderRadius: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', height: '45px', },
    trashIcon: { color: '#E74C3C', fontSize: '22px', marginLeft: '10px', flexShrink: 0, },
    recordStatus: { display: 'flex', alignItems: 'center', color: '#E74C3C', fontSize: '16px', marginLeft: '20px', gap: '10px', fontWeight: 'bold', minWidth: '70px', /* Ensure space for timer */ flexShrink: 0, },
    recordDot: { width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#E74C3C', },
    lockIcon: { fontSize: '12px', color: '#999', marginLeft: '15px', },
    pauseButton: { backgroundColor: 'transparent', color: '#E74C3C', border: 'none', cursor: 'pointer', padding: '5px', marginRight: '15px', zIndex: 5, },
    transparentButton: { backgroundColor: 'transparent', border: 'none', cursor: 'pointer', padding: '5px', zIndex: 5, },
    dropdownMenu: { position: 'absolute', top: '40px', right: '0', backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '4px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', width: '180px', zIndex: 20, padding: '5px 0', },
    menuItem: { padding: '10px 15px', fontSize: '14px', cursor: 'pointer', },
    
    // NEW RECORDING WAVEFORM STYLES
    recordingWaveform: {
        display: 'flex', 
        alignItems: 'flex-end', 
        height: '20px', 
        flexGrow: 1, 
        gap: '2px', 
        padding: '0 10px', 
        justifyContent: 'flex-end',
        marginRight: '20px',
    },
    waveformBar: { 
        backgroundColor: '#999', 
        width: '2px', 
        borderRadius: '1px', 
        transition: 'height 0.1s', 
        minHeight: '2px',
    },

    // EMOJI PICKER STYLES (UNCHANGED)
    emojiPickerContainer: {
        position: 'absolute', bottom: '65px', left: '20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', width: '300px', padding: '10px', zIndex: 30,
    },
    emojiGrid: {
        display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', maxHeight: '200px', overflowY: 'auto',
    },
    emojiButton: { fontSize: '24px', cursor: 'pointer', textAlign: 'center', padding: '5px', transition: 'background-color 0.1s', },
    emojiCloseBar: { borderTop: '1px solid #eee', marginTop: '10px', paddingTop: '5px', textAlign: 'right', },
    emojiCloseIcon: { color: '#7F8C8D', cursor: 'pointer', fontSize: '18px', },
};
 
export default ChatPage;