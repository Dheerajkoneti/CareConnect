import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PostCard from '../components/feed/PostCard'; 
import { FaPlus, FaEllipsisV, FaCheckCircle, FaUpload } from 'react-icons/fa'; 

// --- MOCK REELS DATA ---
const currentUserId = 'user_b'; 
const token = 'MOCK_TOKEN'; 

const initialReels = [
    {
        _id: 'reel_1',
        author: { _id: 'user_a', email: 'Dheeraj@care.com', role: 'volunteer' },
        authorId: 'user_a',
        content: "What happens when you spin a CD faster than it was ever meant to go 🤯⚡",
        fileUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 
        mediaType: 'video', 
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        likesCount: 450, 
        isLikedByUser: false, 
        authorAvatar: 'https://placehold.co/150x150/0000FF/808080?text=H'
    },
    {
        _id: 'reel_2',
        author: { _id: 'user_c', email: 'mental@health.org', role: 'admin' },
        authorId: 'user_c',
        content: "Quick tip for managing stress during exam season. Remember to breathe! 🧘‍♀️",
        fileUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', 
        mediaType: 'video', 
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        likesCount: 99, 
        isLikedByUser: true, 
        authorAvatar: 'https://placehold.co/150x150/00CED1/FFFFFF?text=M' 
    },
];
// --- END MOCK DATA ---


function ReelsViewer() {
    const navigate = useNavigate();
    // ✅ FIX: Re-added setReels to resolve the "not defined" error
    const [reels, setReels] = useState(initialReels); 
    const wrapperRef = useRef(null);
    const fileInputRef = useRef(null); 

    const handleLike = (postId, newLikesCount, isLiked) => { console.log(`Post ${postId} liked status updated: ${isLiked}`); };
    const handleDelete = () => { alert('Delete functionality TBD.'); };
    const handleUpdate = () => { alert('Update functionality TBD.'); };

    // --- UPLOAD LOGIC ---
    const handleUploadClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };
    
    // Handles file selection and adds it to the state
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            // MOCK: Create a temporary URL for immediate display
            const mockObjectURL = URL.createObjectURL(file); 
            
            const newReel = {
                _id: Date.now().toString(), 
                author: { _id: currentUserId, email: 'uploaded@user.com', role: 'volunteer' },
                authorId: currentUserId,
                content: `Uploaded: ${file.name}`,
                fileUrl: mockObjectURL, 
                mediaType: 'video',
                createdAt: new Date().toISOString(),
                likesCount: 0,
                isLikedByUser: false,
                authorAvatar: 'https://placehold.co/150x150/FF8C00/FFFFFF?text=U'
            };

            // Line 74: This now works because setReels is defined.
            setReels(prevReels => [newReel, ...prevReels]); 
            
            // Optional: Scroll to the top to view the new reel
            if (wrapperRef.current) {
                wrapperRef.current.scrollTop = 0;
            }
        }
    };

    // --- SCROLL SNAP & KEYBOARD/SWIPE LOGIC (Preserved) ---
    const scrollToReel = (direction) => {
        if (wrapperRef.current) {
            const wrapper = wrapperRef.current;
            const scrollDistance = wrapper.clientHeight;
            
            if (direction === 'up') {
                wrapper.scrollBy({ top: -scrollDistance, behavior: 'smooth' });
            } else if (direction === 'down') {
                wrapper.scrollBy({ top: scrollDistance, behavior: 'smooth' });
            }
        }
    };
    
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowUp') {
                scrollToReel('up');
            } else if (e.key === 'ArrowDown') {
                scrollToReel('down');
            }
        };
        
        let startY = 0;
        let endY = 0;
        
        const handleTouchStart = (e) => { startY = e.touches[0].clientY; };
        const handleTouchMove = (e) => { endY = e.touches[0].clientY; };
        
        const handleTouchEnd = () => {
            const diff = startY - endY;
            if (diff > 50) { 
                scrollToReel('down');
            } else if (diff < -50) { 
                scrollToReel('up');
            }
        };

        const wrapper = wrapperRef.current;
        if (wrapper) {
            wrapper.addEventListener('touchstart', handleTouchStart);
            wrapper.addEventListener('touchmove', handleTouchMove);
            wrapper.addEventListener('touchend', handleTouchEnd);
        }

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            if (wrapper) {
                wrapper.removeEventListener('touchstart', handleTouchStart);
                wrapper.removeEventListener('touchmove', handleTouchMove);
                wrapper.removeEventListener('touchend', handleTouchEnd);
            }
        };
    }, []); 
    
    const hasContent = reels.length > 0;

    return (
        <div style={styles.pageContainer}>
            
            {/* HIDDEN FILE INPUT ELEMENT */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="video/*" 
                style={{ display: 'none' }}
            />

            {/* Top Navigation Row */}
            <div style={styles.topNav}>
                <FaUpload size={24} style={styles.uploadIcon} onClick={handleUploadClick} />
                
                <div style={styles.topNavCenter}>
                    <span style={styles.topNavTitle}>Reels</span>
                    <span style={styles.topNavFriend}>Friends</span>
                </div>
                <FaEllipsisV size={20} style={styles.ellipsisIcon} onClick={() => alert('Settings')} />
            </div>

            {!hasContent && (
                <div style={styles.noContent}>
                    <h1>No Reels content found.</h1>
                    <p>Be the first to upload a video!</p>
                    <button style={styles.uploadButton} onClick={handleUploadClick}>
                        Upload a Reel
                    </button>
                </div>
            )}

            {/* --- REELS VIEWER AREA (SCROLLABLE CAROUSEL) --- */}
            {hasContent && (
                <div 
                    ref={wrapperRef}
                    style={styles.reelsWrapper}
                >
                    {reels.map((reel) => (
                        <div key={reel._id} style={styles.reelCard}>
                            
                            {/* 1. Video Player */}
                            <video 
                                src={reel.fileUrl} 
                                style={styles.videoPlayer}
                                controls={false} 
                                autoPlay
                                muted 
                                loop
                                playsInline
                            />
                            
                            {/* 2. Interaction Side Bar and Bottom Content Overlay */}
                            <div style={styles.contentOverlay}>
                                
                                {/* A. Right Side: Like, Comment, Share Buttons */}
                                <div style={styles.interactionSidebar}>
                                    <PostCard
                                        post={reel}
                                        currentUserId={currentUserId}
                                        token={token}
                                        onLike={handleLike}
                                        onDelete={handleDelete}
                                        onUpdate={handleUpdate}
                                        isReelsView={true} 
                                    />
                                </div>
                                
                                {/* B. Left Side: Author Info and Caption */}
                                <div style={styles.authorContentArea}>
                                    
                                    {/* Author Info Header (Avatar/Name/Verified) */}
                                    <div style={styles.authorHeader}>
                                        <img src={reel.authorAvatar} alt="Avatar" style={styles.authorAvatar} />
                                        <div style={styles.authorTextGroup}>
                                            <span style={styles.authorName}>hack.thevoid</span>
                                            <FaCheckCircle size={14} color="#3498DB" style={{marginLeft: '5px'}} />
                                            <span style={styles.authorHandle}>@{reel.author.email.split('@')[0]}</span>
                                        </div>
                                    </div>
                                    
                                    {/* Post Caption and Follow Button */}
                                    <div style={styles.postDetails}>
                                        <p style={styles.captionText}>{reel.content}</p>
                                        
                                        {/* Instagram-style Follow Button Row */}
                                        <div style={styles.followActionRow}>
                                            <span style={styles.bottomHandleText}>hack.thevoid</span>
                                            <button style={styles.followButton}>Follow</button>
                                            <FaEllipsisV size={16} color="white" style={{marginLeft: 'auto'}} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
             {/* Back to Feed Button (Top Left) */}
             <button onClick={() => navigate('/feed')} style={styles.backToFeedButton}>
                ← Back to Feed
            </button>
        </div>
    );
}

const styles = {
    pageContainer: {
        backgroundColor: '#000',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        position: 'relative',
        fontFamily: 'Inter, sans-serif'
    },
    // --- TOP NAVIGATION ---
    topNav: {
        position: 'fixed',
        top: 0,
        width: '100%',
        maxWidth: '500px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 15px',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        zIndex: 100,
    },
    topNavCenter: {
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
    },
    topNavTitle: {
        fontSize: '18px',
        fontWeight: 'bold',
        color: 'white',
    },
    topNavFriend: {
        fontSize: '16px',
        color: '#888',
        fontWeight: '500',
    },
    uploadIcon: {
        color: 'white',
        cursor: 'pointer',
    },
    ellipsisIcon: {
        color: 'white',
        cursor: 'pointer',
    },
    backToFeedButton: {
        position: 'fixed',
        top: '60px', 
        left: '20px',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        color: 'white',
        border: 'none',
        padding: '8px 12px',
        borderRadius: '5px',
        cursor: 'pointer',
        zIndex: 50,
        fontWeight: 'bold'
    },
    noContent: {
        textAlign: 'center',
    },
    uploadButton: {
        backgroundColor: '#E74C3C',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '8px',
        marginTop: '20px',
        fontSize: '16px',
        cursor: 'pointer',
    },
    // --- SCROLL SNAP CONTAINER ---
    reelsWrapper: {
        width: '100%',
        maxWidth: '500px',
        height: '100vh', 
        position: 'relative',
        overflowY: 'scroll', 
        scrollSnapType: 'y mandatory', 
        display: 'flex',
        flexDirection: 'column',
        scrollbarWidth: 'none', 
        WebkitOverflowScrolling: 'touch',
        marginTop: '45px' 
    },
    reelCard: {
        minWidth: '100%',
        minHeight: '100vh', 
        position: 'relative',
        scrollSnapAlign: 'start',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    videoPlayer: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        zIndex: 1,
    },
    // --- INTERACTION OVERLAY ---
    contentOverlay: {
        position: 'absolute',
        left: 0,
        bottom: 0,
        width: '100%',
        height: '100%', 
        zIndex: 10,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end', 
        padding: '0 15px 80px 15px', 
        pointerEvents: 'none', 
    },
    interactionSidebar: {
        pointerEvents: 'auto',
        marginBottom: '10px',
        marginLeft: 'auto', 
    },
    authorContentArea: {
        pointerEvents: 'none',
        width: '65%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        alignSelf: 'flex-end', 
    },
    authorHeader: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '10px',
        pointerEvents: 'auto',
    },
    authorAvatar: {
        width: '35px',
        height: '35px',
        borderRadius: '50%',
        marginRight: '10px',
        border: '2px solid white',
    },
    authorTextGroup: {
        display: 'flex',
        alignItems: 'center',
        textShadow: '0 0 5px rgba(0,0,0,0.9)',
    },
    authorName: {
        fontSize: '16px',
        fontWeight: 'bold',
        color: 'white',
    },
    authorHandle: {
        fontSize: '14px',
        color: '#ccc',
        marginLeft: '10px',
    },
    postDetails: {
        textShadow: '0 0 5px rgba(0,0,0,0.9)',
        marginBottom: '10px',
    },
    captionText: {
        fontSize: '14px',
        margin: '0 0 10px 0',
        color: 'white',
        lineHeight: 1.4,
    },
    followActionRow: {
        display: 'flex',
        alignItems: 'center',
        pointerEvents: 'auto',
        marginTop: '10px',
    },
    bottomHandleText: {
        fontSize: '16px',
        fontWeight: 'bold',
        marginRight: '10px',
    },
    followButton: {
        backgroundColor: 'transparent',
        border: '1px solid white',
        color: 'white',
        padding: '5px 15px',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 'bold',
    },
};

export default ReelsViewer;