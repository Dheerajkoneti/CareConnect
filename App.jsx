import React, { useEffect, useState, useRef, useMemo } from 'react';
import { io } from 'socket.io-client';

// NOTE: External library imports like 'simple-peer' and 'react-icons' have been removed 
// and replaced with native browser features (media stream) and inline SVGs to ensure compilation.
// We keep the Peer reference for illustrative purposes but replace its functionality.
const Peer = window.Peer || function() { console.log("Peer functionality is mocked."); };

// --- SOCKET.IO INITIALIZATION ---
// NOTE: Ensure this URL matches your backend server.
const socket = io('http://localhost:5000', { transports: ['websocket', 'polling'] }); 

// Mock Current User and Partner List for Demo
const MOCK_USER = {
    _id: "user_A_123",
    name: "Dini",
    username: "dini_dev",
};
const MOCK_PARTNERS = [
    { id: "user_B_456", name: "Dheeraj Koneti", username: "dheeraj_k", lastMessage: "Hey, are you free for a call?", lastTime: new Date(Date.now() - 3600000) },
    { id: "user_C_789", name: "Yashu", username: "yashu_v", lastMessage: "Good morning.", lastTime: new Date(Date.now() - 7200000) },
];

const AI_CHAT_ENTRY = { 
    id: 'AI_COMPANION', 
    name: 'AI Companion', 
    icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-purple-600">
            <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm4.28 10.28a.75.75 0 000-1.06l-3-3a.75.75 0 00-1.06 0l-3 3a.75.75 0 101.06 1.06l1.72-1.72V15a.75.75 0 001.5 0v-3.44l1.72 1.72a.75.75 0 001.06 0z" clipRule="evenodd" />
        </svg>
    ), 
    lastMessage: 'Ask me anything about wellness.', 
    lastTime: new Date(Date.now() + 999999999) 
};


// Main Application Component
export default function App() {
    // --- Global State ---
    const [page, setPage] = useState('chats'); // 'chats' or 'video'
    const [currentChatPartner, setCurrentChatPartner] = useState(MOCK_PARTNERS[0]); // Selected chat partner
    const [chatList, setChatList] = useState([AI_CHAT_ENTRY, ...MOCK_PARTNERS]);
    const [chatHistory, setChatHistory] = useState([]);
    
    // --- Video Call State ---
    const [stream, setStream] = useState(null);
    const [receivingCall, setReceivingCall] = useState(false);
    const [caller, setCaller] = useState('');
    const [callerName, setCallerName] = useState('');
    const [callerSignal, setCallerSignal] = useState();
    const [callAccepted, setCallAccepted] = useState(false);
    const [callEnded, setCallEnded] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const myVideo = useRef();
    const userVideo = useRef();
    const connectionRef = useRef();

    // --- CHAT STATE REFS ---
    const [messageText, setMessageText] = useState('');
    const chatContainerRef = useRef(null);


    // --- 1. INITIAL SETUP & SOCKET LISTENERS ---
    useEffect(() => {
        if (!MOCK_USER?._id) return;

        // Register user for direct messaging/calling
        socket.emit('register_user', MOCK_USER._id);

        // Get local media stream for video calls
        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((mediaStream) => {
            setStream(mediaStream);
            if (myVideo.current) myVideo.current.srcObject = mediaStream;
        }).catch(err => {
            console.error("Error accessing media devices:", err);
            // Inform user about microphone/camera access needed
        });

        // Chat Listener: Receive new messages
        socket.on('receive_message', (data) => {
            // Only show message in the active chat window
            if (data.senderId === currentChatPartner.id || data.receiverId === currentChatPartner.id) {
                setChatHistory(prev => [...prev, data]);
            }
        });

        // Chat List Listener: Message sent/received update (Moves chat to top)
        socket.on('chat_updated', ({ userId, lastTime }) => {
            setChatList(prevList => {
                const newList = prevList.map(chat => 
                    chat.id === userId ? { ...chat, lastTime: new Date(lastTime), lastMessage: 'New message...' } : chat
                );
                // Re-sort the list by time (newest first)
                return newList.sort((a, b) => new Date(b.lastTime).getTime() - new Date(a.lastTime).getTime());
            });
        });

        // Video Listener: Incoming call
        socket.on('incoming_call', (data) => {
            setReceivingCall(true);
            setCaller(data.from);
            setCallerName(data.fromName || "Unknown Caller");
            setCallerSignal(data.signal);
            // NOTE: You might want to switch to a call screen automatically here
        });
        
        // Video Listener: User went offline while calling
        socket.on('user_offline', ({ userId }) => {
            console.log(`Call failed: User ${userId} is offline.`);
            // You can show a notification here
        });


        // Cleanup
        return () => {
            socket.off('receive_message');
            socket.off('chat_updated');
            socket.off('incoming_call');
            socket.off('user_offline');
        };
    }, [currentChatPartner]); // Re-run effect when active partner changes

    // Auto-scroll to bottom on new message
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatHistory]);

    // --- 2. CHAT LOGIC ---
    const sendMessage = () => {
        const targetId = currentChatPartner.id;
        if (!messageText || !targetId || !MOCK_USER?._id) return;
        
        // Mock AI response if talking to AI
        if (targetId === 'AI_COMPANION') {
            setChatHistory(prev => [...prev, { senderId: MOCK_USER._id, content: messageText, timestamp: new Date() }]);
            setMessageText('');
            setTimeout(() => {
                setChatHistory(prev => [...prev, { senderId: 'AI_COMPANION', content: "I hear you. Let's practice a breathing exercise.", timestamp: new Date() }]);
            }, 1000);
            return;
        }

        // Send message via Socket.io
        socket.emit('send_message', {
            senderId: MOCK_USER._id,
            receiverId: targetId,
            content: messageText,
        });
        setMessageText('');
    };
    
    // --- 3. VIDEO CALL LOGIC (MOCKED without Simple-Peer) ---
    const callUser = (id) => {
        setCallEnded(false);
        setCallAccepted(false);
        setPage('video');
        
        // NOTE: In a real app, Peer setup logic would go here.
        // Mocking the signaling process:
        socket.emit('call_user', {
            userToCall: id,
            signalData: { mock: 'signal' }, // Mock signal
            from: MOCK_USER._id,
            fromName: MOCK_USER.name,
        });
        
        // Mock call acceptance for the demo flow
        setTimeout(() => {
            setCallAccepted(true);
        }, 2000);
    };

    const answerCall = () => {
        setCallAccepted(true);
        setReceivingCall(false);
        setPage('video');
        
        // NOTE: In a real app, Peer setup and signal processing would go here.
        // Mocking signal answer:
        socket.emit('answer_call', { signal: { mock: 'answer' }, to: caller });
    };

    const leaveCall = () => {
        setCallEnded(true);
        setCallAccepted(false);
        setReceivingCall(false);
        
        // Stop local media tracks
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setPage('chats'); 
    };
    
    const handleChatSelect = (chat) => {
        setCurrentChatPartner(chat);
        // Load messages for the selected chat (mocked here)
        setChatHistory([]); 
        setPage('chats');
    };

    // --- RENDER HELPERS ---
    const formatChatTime = (date) => {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Inline SVG for User Circle
    const UserCircleIcon = ({ color }) => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={color} className="w-8 h-8">
            <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.026 18.026 0 0112 22.5c-4.789 0-8.73-1.47-10.635-3.8A.75.75 0 013.75 20.105z" clipRule="evenodd" />
        </svg>
    );
    
    // Inline SVG for Send/Chat Button
    const ChatSendIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path d="M3.105 2.553a1 1 0 00-1.788 0l-1.353 9.471a1 1 0 00.748 1.137l5.367 1.073a.75.75 0 00.322-.055l9.261-3.088a1 1 0 00.324-1.789l-9.261-3.088a.75.75 0 00-.322-.055L3.105 2.553z" />
        </svg>
    );

    // Inline SVG for Video/Mic/Phone icons (using heroicons for simplicity)
    const VideoIcon = ({ size = 24, color = 'currentColor' }) => <svg xmlns="http://www.w3.org/2000/svg" className={`w-${size/4} h-${size/4}`} viewBox="0 0 24 24" fill={color}><path d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v15a.75.75 0 01-1.28.53l-4.72-4.72zm-7.5-6a.75.75 0 00-.75.75v12a.75.75 0 00.75.75h9a.75.75 0 00.75-.75v-12a.75.75 0 00-.75-.75h-9zM7.5 4.5h9v12h-9z" /></svg>;
    const PhoneIcon = ({ size = 24, color = 'currentColor' }) => <svg xmlns="http://www.w3.org/2000/svg" className={`w-${size/4} h-${size/4}`} viewBox="0 0 24 24" fill={color}><path fillRule="evenodd" d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.579 1.848 1.352l1.624 4.873a1.5 1.5 0 01-.724 1.917l-1.352.724a1.5 1.5 0 00-.785 1.488 15.652 15.652 0 006.012 6.012 1.5 1.5 0 001.488-.784l.724-1.352a1.5 1.5 0 011.917-.724l4.873 1.624c.773.238 1.352.988 1.352 1.848v1.372a3 3 0 01-3 3H5.25a3 3 0 01-3-3V4.5z" clipRule="evenodd" /></svg>;
    const PhoneSlashIcon = ({ size = 24, color = 'currentColor' }) => <svg xmlns="http://www.w3.org/2000/svg" className={`w-${size/4} h-${size/4}`} viewBox="0 0 24 24" fill={color}><path d="M3.375 3C2.339 3 1.5 3.84 1.5 4.875V11.25a.75.75 0 001.5 0V4.875a.375.375 0 01.375-.375h14.25a.375.375 0 01.375.375v4.5a.75.75 0 001.5 0v-4.5A1.5 1.5 0 0019.125 3H3.375zM12 11.25a.75.75 0 00.75.75h1.5a.75.75 0 000-1.5H12a.75.75 0 00-.75.75zM12 14.25a.75.75 0 00.75.75h1.5a.75.75 0 000-1.5H12a.75.75 0 00-.75.75zM14.25 17.25a.75.75 0 000-1.5h-1.5a.75.75 0 000 1.5h1.5z" /><path fillRule="evenodd" d="M12 21.75a3 3 0 003-3v-4.5a.75.75 0 00-1.5 0v4.5a1.5 1.5 0 01-1.5 1.5H8.25a.375.375 0 00-.375.375v.75a.75.75 0 001.5 0v-.75a.375.375 0 01.375-.375h3.75z" clipRule="evenodd" /></svg>;
    const MicIcon = ({ size = 24, color = 'currentColor' }) => <svg xmlns="http://www.w3.org/2000/svg" className={`w-${size/4} h-${size/4}`} viewBox="0 0 24 24" fill={color}><path d="M8.25 4.5a3 3 0 00-3 3v9a3 3 0 003 3h7.5a3 3 0 003-3v-9a3 3 0 00-3-3H8.25z" /><path d="M12 3a.75.75 0 00-.75.75v.75a.75.75 0 001.5 0v-.75A.75.75 0 0012 3z" /></svg>;


    const renderChatList = useMemo(() => {
        return chatList.map((chat) => (
            <div 
                key={chat.id} 
                onClick={() => handleChatSelect(chat)}
                className={`flex items-center p-3 cursor-pointer transition duration-150 ${currentChatPartner.id === chat.id ? 'bg-purple-100' : 'hover:bg-gray-50'}`}
            >
                <div className="mr-3">
                    {chat.icon || <UserCircleIcon color="#3b82f6" />} {/* Use inline SVG */}
                </div>
                <div className="flex-1 overflow-hidden">
                    <p className="font-semibold text-gray-800">{chat.name}</p>
                    <p className="text-sm text-gray-500 truncate">{chat.lastMessage}</p>
                </div>
                <span className="text-xs text-gray-400">{formatChatTime(chat.lastTime)}</span>
            </div>
        ));
    }, [chatList, currentChatPartner]);
    
    
    // --- MAIN RENDER ---
    return (
        <div className="flex h-screen antialiased text-gray-800 bg-gray-100 font-sans">
            {/* Sidebar/Chat List */}
            <div className="flex flex-col w-full md:w-1/3 bg-white border-r border-gray-200">
                <div className="p-4 border-b border-gray-200">
                    <h1 className="text-2xl font-bold text-purple-700">Active Conversations</h1>
                    <p className="text-sm text-gray-500">Welcome, {MOCK_USER.username}</p>
                </div>
                <div className="overflow-y-auto flex-1">
                    {renderChatList}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex flex-col flex-auto w-full md:w-2/3 p-4 bg-white">
                
                {/* INCOMING CALL NOTIFICATION (Global Banner) */}
                {receivingCall && !callAccepted && (
                    <div className="p-4 mb-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded-lg shadow-md flex justify-between items-center">
                        <p className="font-bold">📞 Incoming Call from {callerName}</p>
                        <div className="space-x-2">
                             <button 
                                onClick={leaveCall} // Decline call
                                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full transition duration-200"
                            >
                                Decline
                            </button>
                            <button 
                                onClick={answerCall} 
                                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full transition duration-200 shadow-lg"
                            >
                                Answer
                            </button>
                        </div>
                    </div>
                )}
                
                {/* RENDER CHAT OR VIDEO */}
                {page === 'chats' && (
                    <div className="flex flex-col h-full border rounded-xl shadow-lg overflow-hidden">
                        {/* Chat Header */}
                        <div className="p-4 border-b bg-purple-50 flex items-center justify-between">
                            <h3 className="text-xl font-semibold text-purple-800">{currentChatPartner.name}</h3>
                            {currentChatPartner.id !== 'AI_COMPANION' && (
                                <button 
                                    onClick={() => callUser(currentChatPartner.id)} 
                                    className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-full transition duration-150 shadow-md"
                                >
                                    <VideoIcon size={18} color="white" />
                                </button>
                            )}
                        </div>

                        {/* Message History */}
                        <div 
                            ref={chatContainerRef}
                            className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
                        >
                            {chatHistory.length === 0 && (
                                <div className="text-center text-gray-400 mt-10">
                                    Start a new conversation with {currentChatPartner.name}.
                                </div>
                            )}
                            {chatHistory
                                .filter(msg => 
                                    (msg.senderId === MOCK_USER._id && msg.receiverId === currentChatPartner.id) ||
                                    (msg.senderId === currentChatPartner.id && msg.receiverId === MOCK_USER._id) ||
                                    (currentChatPartner.id === 'AI_COMPANION' && (msg.senderId === 'AI_COMPANION' || msg.senderId === MOCK_USER._id))
                                )
                                .map((msg, i) => (
                                    <div
                                        key={i}
                                        className={`flex ${msg.senderId === MOCK_USER._id ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-xs px-4 py-2 rounded-xl text-sm shadow-md ${
                                                msg.senderId === MOCK_USER._id
                                                    ? 'bg-purple-600 text-white rounded-br-none'
                                                    : 'bg-gray-200 text-gray-800 rounded-tl-none'
                                            }`}
                                        >
                                            <p>{msg.content}</p>
                                            <p className="text-xs mt-1 opacity-70">
                                                {formatChatTime(msg.timestamp)}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t flex gap-3 bg-white">
                            <input
                                className="flex-1 p-3 border border-gray-300 rounded-full focus:ring-purple-500 focus:border-purple-500"
                                value={messageText}
                                onChange={(e) => setMessageText(e.target.value)}
                                onKeyDown={(e) => (e.key === 'Enter' ? sendMessage() : null)}
                                placeholder="Type a message..."
                            />
                            <button 
                                onClick={sendMessage} 
                                className="bg-purple-600 hover:bg-purple-700 text-white text-lg w-12 h-12 rounded-full shadow-md flex items-center justify-center disabled:opacity-50"
                                disabled={!messageText}
                            >
                                <ChatSendIcon />
                            </button>
                        </div>
                    </div>
                )}
                
                {/* RENDER VIDEO CALL */}
                {page === 'video' && (
                    <div className="flex flex-col items-center justify-center h-full bg-gray-900 rounded-xl shadow-2xl">
                        <h2 className="text-xl text-white mb-6">Call with {currentChatPartner.name}</h2>
                        
                        <div className="relative flex justify-center gap-4 mb-8">
                            {/* Partner Video */}
                            {(callAccepted && !callEnded) ? (
                                <div className="relative w-96 h-64 bg-purple-900 rounded-lg overflow-hidden shadow-xl">
                                    <video playsInline ref={userVideo} autoPlay className="w-full h-full object-cover" />
                                    <p className="absolute bottom-3 left-3 text-white font-semibold text-lg bg-black bg-opacity-50 px-3 rounded">{currentChatPartner.name}</p>
                                </div>
                            ) : (
                                <div className="relative w-96 h-64 bg-gray-700 rounded-lg shadow-xl flex items-center justify-center">
                                    <VideoIcon size={64} color="#9ca3af" />
                                    <p className="absolute text-white font-semibold mt-20">{callEnded ? "Call Ended" : "Ringing..."}</p>
                                </div>
                            )}

                            {/* My Video (Small PIP) */}
                            <div className="absolute top-4 right-4 w-40 h-30 bg-gray-800 rounded-lg overflow-hidden shadow-2xl border-4 border-white">
                                {stream && (
                                    <video playsInline muted ref={myVideo} autoPlay className="w-full h-full object-cover" />
                                )}
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex gap-6">
                            <button 
                                onClick={() => { 
                                    if(stream) stream.getAudioTracks()[0].enabled = !stream.getAudioTracks()[0].enabled; 
                                    setIsMuted(!isMuted); 
                                }}
                                className={`p-4 rounded-full shadow-lg transition duration-200 ${isMuted ? 'bg-red-500 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
                                disabled={!callAccepted || callEnded}
                            >
                                <MicIcon size={24} color={isMuted ? 'white' : 'currentColor'} />
                            </button>
                            <button 
                                onClick={() => { 
                                    if(stream) stream.getVideoTracks()[0].enabled = !stream.getVideoTracks()[0].enabled; 
                                    setIsVideoOff(!isVideoOff); 
                                }}
                                className={`p-4 rounded-full shadow-lg transition duration-200 ${isVideoOff ? 'bg-red-500 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
                                disabled={!callAccepted || callEnded}
                            >
                                <VideoIcon size={24} color={isVideoOff ? 'white' : 'currentColor'} />
                            </button>
                            
                            {(callAccepted && !callEnded) ? (
                                <button 
                                    onClick={leaveCall} 
                                    className="p-4 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg transition duration-200"
                                >
                                    <PhoneSlashIcon size={24} color="white" />
                                </button>
                            ) : (
                                 <button 
                                    onClick={() => callUser(currentChatPartner.id)} 
                                    className="p-4 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg transition duration-200 disabled:opacity-50"
                                    disabled={!currentChatPartner.id || callAccepted || callEnded || !stream}
                                >
                                    <PhoneIcon size={24} color="white" /> 
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
