// client/src/components/feed/PostCard.js (FINAL CLEANUP)
import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // ADDED: For Message button navigation

// Utility function to detect double-click vs single-click (UNCHANGED)
const useDoubleClick = (onDoubleClick) => {
    const timerRef = useRef(null);
    const handleClick = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
            onDoubleClick();
        } else {
            timerRef.current = setTimeout(() => {
                timerRef.current = null;
            }, 300);
        }
    };
    return handleClick;
};

const PostCard = ({ post, currentUserId, token, onDelete, onUpdate, onLike, isReelsView }) => {
    
    const navigate = useNavigate();

    // State Initialization
    // ❌ REMOVED: isEditing and editedContent (Unused variables/warnings cleared)
    const [isLiked, setIsLiked] = useState(post.isLikedByUser || false); 
    const [likesCount, setLikesCount] = useState(post.likesCount || 0);
    const [showComments, setShowComments] = useState(false); 
    const [newCommentText, setNewCommentText] = useState(''); 
    
    // State for following status
    const [isFollowing, setIsFollowing] = useState(false); 

    const isAuthor = currentUserId === post.authorId; 
    const config = { headers: { Authorization: `Bearer ${token}` } };
    
    // --- LIKES LOGIC (API INTEGRATION) ---
    const handleLikeToggle = async () => {
        const action = isLiked ? 'unlike' : 'like';
        try {
            // Optimistic Update
            setIsLiked(!isLiked);
            setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);

            const response = await axios.post(`/api/posts/${post._id}/like`, { action }, config);
            
            // Final update based on API response
            const newLikesCount = response.data.likesCount;
            setIsLiked(response.data.isLikedByUser);
            setLikesCount(newLikesCount);
            onLike(post._id, newLikesCount, response.data.isLikedByUser); 
            
        } catch (error) {
            // Revert optimistic update if API fails
            setIsLiked(isLiked);
            setLikesCount(likesCount);
            console.error(`Error ${action}ing post:`, error);
            alert(`Failed to ${action} post.`);
        }
    };
    
    const handleDoubleClick = useDoubleClick(handleLikeToggle);

    // --- MESSAGE AND FOLLOW LOGIC (API INTEGRATION) ---
    const handleMessage = () => {
        const authorId = post.authorId || post.author?._id;
        if (authorId) {
            // ✅ FIX: Navigate to the chat route
            navigate(`/chat/${authorId}`);
        } else {
            alert("Author ID missing, cannot start chat.");
        }
    };

    const handleFollowToggle = async () => {
        const authorId = post.authorId || post.author?._id;
        if (!authorId) return alert("Cannot follow: Author ID missing.");

        const action = isFollowing ? 'unfollow' : 'follow';

        try {
            const response = await axios.post(`/api/users/${authorId}/follow`, { action }, config);
            
            // ✅ FIX: Use API response to update status
            setIsFollowing(response.data.isFollowing); 

        } catch (error) {
            console.error(`Error ${action}ing user:`, error.response?.data || error);
            alert(`Failed to ${action} user. Please check server logs.`);
        }
    };

    // --- SHARE, COMMENT, DELETE LOGIC ---
    const handleShare = () => { alert('Link copied!'); };
    const handleCommentToggle = () => { setShowComments(!showComments); };
    const handlePostComment = async () => { /* ... */ };
    const handleDelete = async () => { /* ... */ };
    // ❌ REMOVED: handleEditSubmit (Unused function/warning cleared)
    
    // --- CONDITIONAL STYLING FIX ---
    const isListView = !isReelsView;
    const cardStyle = isReelsView ? postCardStyles.reelsCard : postCardStyles.card;
    const contentStyle = isReelsView ? postCardStyles.reelsContent : postCardStyles.postContent;
    const authorColor = isReelsView ? '#FFFFFF' : '#3498DB';
    const timestampColor = isReelsView ? 'rgba(255, 255, 255, 0.7)' : '#999';

    const iconColor = isListView ? '#7F8C8D' : 'white'; 
    const countColor = isListView ? '#7F8C8D' : 'white';
    
    // --- RENDERING VIEW MODE ---
    return (
        <div style={cardStyle}>
            
            {/* Background Image for Reels View */}
            {isReelsView && post.fileUrl && (
                <img src={post.fileUrl} alt="Post Background" style={postCardStyles.reelsImage} />
            )}
            
            {/* HEADER: Includes Author Name, Message, and Follow Buttons */}
            <div style={postCardStyles.postHeaderDetail}>
                <div style={postCardStyles.authorInfoWrapper}>
                    <p style={{...postCardStyles.author, color: authorColor}}>
                        {post.authorEmail || post.author?.email || 'Unknown Volunteer'} 
                        ({post.authorRole || 'volunteer'})
                    </p>
                    
                    {/* Follow Button */}
                    {!isAuthor && (
                        <button 
                            onClick={handleFollowToggle} 
                            style={{
                                ...postCardStyles.followButton,
                                backgroundColor: isFollowing ? '#546E7A' : '#3498DB',
                                color: isFollowing ? '#CFD8DC' : 'white',
                            }}
                        >
                            {isFollowing ? 'Following' : 'Follow'}
                        </button>
                    )}
                    
                    {/* Message Button */}
                    {!isAuthor && (
                            <button 
                                onClick={handleMessage} 
                                style={postCardStyles.messageButton}
                            >
                                Message
                            </button>
                    )}
                </div>
                
                {isAuthor && !isReelsView && (
                    <div style={postCardStyles.menu}>
                        {/* ⚠️ NOTE: This now calls onUpdate, which should open your edit modal */}
                        <button onClick={onUpdate} style={postCardStyles.menuButton}>Edit</button> 
                        <button onClick={handleDelete} style={{...postCardStyles.menuButton, color: '#E74C3C'}}>Delete</button>
                    </div>
                )}
            </div>
            
            <p style={{...postCardStyles.timestamp, color: timestampColor}}>
                posted on: {new Date(post.createdAt).toLocaleString()}
            </p>

            {/* MAIN CONTENT AREA */}
            <div style={postCardStyles.mainContentWrapper}>
                
                {/* A. Post Content (Double-Click Listener) */}
                <div style={contentStyle} onClick={handleDoubleClick} onContextMenu={(e) => e.preventDefault()} >
                    {/* Uses post.content directly */}
                    <p style={isReelsView ? postCardStyles.contentParagraph : {}}>{post.content}</p> 
                    {!isReelsView && post.fileUrl && (<img src={post.fileUrl} alt="Post Content" style={postCardStyles.image} />)}
                </div>
                
                {/* B. SIDE INTERACTION BAR */}
                <div style={postCardStyles.interactionSidebar}>
                    
                    {/* 1. Like Button */}
                    <button onClick={handleLikeToggle} style={postCardStyles.sideActionButton}>
                        <span style={{...postCardStyles.sideIcon, color: isLiked ? '#E74C3C' : iconColor, fontSize: isListView ? '22px' : '32px', filter: isListView ? 'none' : postCardStyles.sideIcon.filter}}>
                            {isLiked ? '❤️' : '🤍'}
                        </span>
                        <span style={{...postCardStyles.sideCount, color: countColor}}>{likesCount}</span>
                    </button>
                    
                    {/* 2. Comment Button */}
                    <button onClick={handleCommentToggle} style={postCardStyles.sideActionButton}>
                        <span style={{...postCardStyles.sideIcon, color: iconColor, fontSize: isListView ? '22px' : '32px', filter: isListView ? 'none' : postCardStyles.sideIcon.filter}}>
                            💬
                        </span>
                        <span style={{...postCardStyles.sideCount, color: countColor}}>Comment</span>
                    </button>
                    
                    {/* 3. Share Button */}
                    <button onClick={handleShare} style={postCardStyles.sideActionButton}>
                        <span style={{...postCardStyles.sideIcon, color: iconColor, fontSize: isListView ? '22px' : '32px', filter: isListView ? 'none' : postCardStyles.sideIcon.filter}}>
                            🔗
                        </span>
                        <span style={{...postCardStyles.sideCount, color: countColor}}>Share</span>
                    </button>
                    
                </div>
            </div>

            {/* COMMENT SECTION */}
            {showComments && (
                <div style={postCardStyles.commentSection}>
                    <h4 style={postCardStyles.commentHeader}>Comments</h4> 
                    <div style={postCardStyles.commentInputWrapper}>
                        <input type="text" placeholder="Add a comment..." style={postCardStyles.commentInput} value={newCommentText} onChange={(e) => setNewCommentText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handlePostComment(); }} />
                        <button onClick={handlePostComment} style={postCardStyles.commentPostButton} disabled={!newCommentText.trim()}>
                            <span style={{ fontSize: '18px' }}>▶️</span>
                        </button>
                    </div>
                    
                    {/* Placeholder Comments List */}
                    <div style={postCardStyles.commentsList}>
                        <p style={postCardStyles.placeholderComment}>
                            <span style={postCardStyles.commentAuthor}>Volunteer A:</span> This is a great initiative! Keep up the good work.
                        </p>
                        <p style={postCardStyles.placeholderComment}>
                            <span style={postCardStyles.commentAuthor}>Admin:</span> We appreciate the update. Thanks for sharing!
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- STYLES ---
const postCardStyles = {
    // === CARD & REELS STYLES ===
    card: { backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '700px', },
    reelsCard: { backgroundColor: 'transparent', padding: '40px 20px', color: 'white', height: '100%', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', position: 'relative', zIndex: 10, },
    reelsImage: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: -1, },
    reelsContent: { flexGrow: 1, paddingRight: '15px', cursor: 'pointer', userSelect: 'none', maxWidth: '80%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', },
    contentParagraph: { backgroundColor: 'rgba(0, 0, 0, 0.5)', padding: '10px', borderRadius: '4px', fontSize: '16px', },
    
    // 💡 HEADER STYLES
    postHeaderDetail: { 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '10px', 
        '@media (min-width: 768px)': { 
            position: 'absolute', top: '20px', width: '90%', left: '50%', transform: 'translateX(-50%)', zIndex: 100 
        } 
    },
    authorInfoWrapper: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    author: { fontWeight: 'bold', margin: 0, fontSize: '15px' },
    timestamp: { fontSize: '12px', marginBottom: '15px' },
    followButton: {
        padding: '5px 12px',
        fontSize: '12px',
        fontWeight: 'bold',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        flexShrink: 0,
    },
    messageButton: {
        padding: '5px 12px',
        fontSize: '12px',
        fontWeight: 'bold',
        backgroundColor: '#7F8C8D', // Neutral gray for message
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        flexShrink: 0,
    },
    
    // --- Layout & Text ---
    mainContentWrapper: { display: 'flex', alignItems: 'flex-end', gap: '15px', width: '100%', paddingBottom: '20px' },
    postContent: { flexGrow: 1, paddingRight: '15px', cursor: 'pointer', userSelect: 'none' },
    image: { maxWidth: '100%', height: 'auto', borderRadius: '4px', marginTop: '10px' },

    // --- SIDEBAR BUTTON STYLES ---
    interactionSidebar: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 0', gap: '15px', flexShrink: 0, minWidth: '60px' },
    sideActionButton: { 
        display: 'flex', flexDirection: 'column', alignItems: 'center', 
        background: 'none', border: 'none', cursor: 'pointer', padding: '5px', 
        fontSize: '14px', color: 'white',
        height: '60px', width: '60px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.4)', transition: 'all 0.2s ease',
    },
    sideIcon: { fontSize: '32px', marginBottom: '2px', filter: 'drop-shadow(0 0 5px rgba(0,0,0,0.8))', color: 'white' },
    sideCount: { fontWeight: '600', fontSize: '12px', color: 'white' },

    // --- COMMENT SECTION STYLES ---
    commentSection: { width: '100%', backgroundColor: '#2C3E50', padding: '15px', borderRadius: '8px', marginTop: '10px', maxHeight: '30vh', overflowY: 'auto', boxShadow: 'inset 0 0 5px rgba(0, 0, 0, 0.4)', color: '#ECF0F1', },
    commentHeader: { fontSize: '16px', color: '#ECF0F1', borderBottom: '1px solid #3A536B', paddingBottom: '5px', marginBottom: '15px', },
    commentInputWrapper: { display: 'flex', marginBottom: '15px', gap: '10px', alignItems: 'center', },
    commentInput: { flexGrow: 1, padding: '10px 15px', borderRadius: '25px', border: '1px solid #3A536B', backgroundColor: '#ECF0F1', color: '#2C3E50', outline: 'none', },
    commentPostButton: { backgroundColor: '#3498DB', color: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background-color 0.2s', flexShrink: 0, boxShadow: '0 2px 5px rgba(0, 0, 0, 0.3)', },
    placeholderComment: { fontSize: '14px', color: '#ECF0F1', marginBottom: '10px', padding: '5px 0', lineHeight: '1.4', },
    commentAuthor: { fontWeight: 'bold', color: '#ADD8E6', marginRight: '5px', },

    // --- Edit/Delete Styles ---
    menu: { display: 'flex', gap: '10px' },
    menuButton: { background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: '500' },
    editArea: { width: '100%', minHeight: '100px', marginBottom: '10px', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' },
    editActions: { display: 'flex', justifyContent: 'flex-end', gap: '10px' },
    saveBtn: { backgroundColor: '#27AE60', color: 'white', padding: '8px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    cancelBtn: { backgroundColor: '#95A5A6', color: 'white', padding: '8px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer' }
};

export default PostCard;