import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaHeart, FaComment, FaShare } from 'react-icons/fa'; 

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
    const [isLiked, setIsLiked] = useState(post.isLikedByUser || false); 
    const [likesCount, setLikesCount] = useState(post.likesCount || 0);
    const [showComments, setShowComments] = useState(false); 
    const [newCommentText, setNewCommentText] = useState(''); 
    const [isFollowing, setIsFollowing] = useState(false); 
    const [isEditing, setIsEditing] = useState(false); 
    const [editText, setEditText] = useState(post.content || ''); // State for editing content

    const postId = post._id || post.id;
    const authorId = post.authorId || post.author?._id; 
    
    const isAuthor = currentUserId === authorId; 
    const config = { headers: { Authorization: `Bearer ${token}` } };
    
    // 💡 MEDIA FIX: Construct the full URL for the media asset
    const BACKEND_URL =
  process.env.REACT_APP_API_URL || "https://careconnect-dini.onrender.com";

const mediaSource =
  post.mediaUrl && post.mediaUrl.startsWith("/uploads/")
    ? `${BACKEND_URL}${post.mediaUrl}`
    : post.mediaUrl;

    // Determine media type for rendering
    let mediaType = null;
    if (mediaSource) {
        const lowerSource = mediaSource.toLowerCase();
        if (lowerSource.endsWith('.mp4') || lowerSource.endsWith('.webm') || lowerSource.endsWith('.ogg')) {
            mediaType = 'video';
        } else if (lowerSource.endsWith('.jpg') || lowerSource.endsWith('.png') || lowerSource.endsWith('.gif') || lowerSource.endsWith('.jpeg')) {
            mediaType = 'image';
        }
    }

    // --- LIKES LOGIC (API IMPLEMENTATION) ---
    const handleLikeToggle = async () => {
        if (!postId) return alert("Error: Post ID is missing. Cannot like.");

        const action = isLiked ? 'unlike' : 'like';
        try {
            // Optimistic update
            setIsLiked(!isLiked);
            setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);

            const response = await axios.post(`/api/posts/${postId}/like`, { action }, config);
            
            // Re-sync state based on API response
            const newLikesCount = response.data.likesCount;
            const newIsLiked = response.data.isLikedByUser;
            setIsLiked(newIsLiked);
            setLikesCount(newLikesCount);
            onLike(post._id, newLikesCount, newIsLiked); // Propagate up to parent feed

        } catch (error) {
            // Revert optimistic update on failure
            setIsLiked(isLiked);
            setLikesCount(likesCount);
            console.error(`Error ${action}ing post:`, error);
            alert(`Failed to ${action} post. (Check Network/Backend)`);
        }
    };
    
    const handleDoubleClick = useDoubleClick(handleLikeToggle);

    // --- MESSAGE AND FOLLOW LOGIC (UNCHANGED) ---
    const handleMessage = () => {
        if (authorId) {
            navigate(`/chat/${authorId}`); 
        } else {
            alert("Author ID missing, cannot start chat.");
        }
    };

    const handleFollowToggle = async () => {
        if (!authorId) return alert("Cannot follow: Author ID missing.");

        const action = isFollowing ? 'unfollow' : 'follow';

        try {
            const response = await axios.post(`/api/users/${authorId}/follow`, { action }, config);
            setIsFollowing(response.data.isFollowing); 

        } catch (error) {
            console.error(`Error ${action}ing user:`, error.response?.data || error);
            alert(`Failed to ${action} user. Please check server logs.`);
        }
    };

    // --- SHARE, COMMENT, DELETE LOGIC (IMPLEMENTED) ---
    const handleShare = () => { 
        if (navigator.share) {
            navigator.share({
                title: 'Community Post',
                text: post.content.substring(0, 50) + '...',
                url: `${window.location.origin}/post/${postId}`,
            }).catch((error) => console.log('Error sharing', error));
        } else {
            navigator.clipboard.writeText(`${window.location.origin}/post/${postId}`);
            alert('Link copied to clipboard!');
        }
    };
    
    const handleCommentToggle = () => { setShowComments(!showComments); };
    
    const handlePostComment = async () => { 
        if (!newCommentText.trim() || !postId) return;

        try {
            // API Endpoint: POST /api/posts/:postId/comments
            await axios.post(`/api/posts/${postId}/comments`, { 
                content: newCommentText 
            }, config);
            
            setNewCommentText('');
            // NOTE: You'll need to fetch and update the actual comments list here
            alert("Comment posted successfully! (API called, but comment list is static placeholder)");

        } catch (error) {
            console.error("Error posting comment:", error.response?.data || error);
            alert(`Failed to post comment. Error: ${error.response?.data?.message || error.message}`);
        }
    };
    
    const handleDelete = async () => { 
        if (!isAuthor) {
            alert("You are not authorized to delete this post.");
            return;
        }

        const confirmDelete = window.confirm("Are you sure you want to delete this post? This action cannot be undone.");
        if (!confirmDelete) return;

        try {
            await axios.delete(`/api/posts/${postId}`, config);
            onDelete(postId); // Update parent state
        } catch (error) {
            console.error("Error deleting post:", error.response?.data || error);
            alert(`Failed to delete post. Error: ${error.response?.data?.message || error.message}`);
        }
    };

    // --- EDIT POST LOGIC (IMPLEMENTED) ---
    const handleSaveEdit = async () => {
        if (editText.trim() === post.content.trim()) {
            setIsEditing(false); 
            return;
        }
        if (!editText.trim()) {
            alert("Post content cannot be empty.");
            return;
        }

        try {
            const response = await axios.put(`/api/posts/${postId}`, { content: editText }, config);
            
            onUpdate(postId, response.data.updatedPost); // Update parent state
            
            setIsEditing(false); // Exit edit mode

        } catch (error) {
            console.error("Error updating post:", error.response?.data || error);
            alert(`Failed to update post. Error: ${error.response?.data?.message || error.message}`);
        }
    };
    
    // --- CONDITIONAL STYLING FIX (UNCHANGED) ---
    const isListView = !isReelsView;
    const cardStyle = isReelsView ? postCardStyles.reelsCard : postCardStyles.card;
    const authorColor = isReelsView ? '#FFFFFF' : '#3498DB';
    const iconColor = isListView ? '#546E7A' : 'white'; 
    
    // --- RENDERING VIEW MODE ---
    return (
        <div style={cardStyle}>
            
            {/* Background Image/Video for Reels View */}
            {isReelsView && mediaSource && (
                mediaType === 'video' ? (
                    <video src={mediaSource} style={postCardStyles.reelsImage} autoPlay loop muted playsInline />
                ) : (
                    <img src={mediaSource} alt="Post Background" style={postCardStyles.reelsImage} />
                )
            )}
            
            {/* 1. POST HEADER (Author, Follow, Menu) */}
            <div style={postCardStyles.postHeader}>
                <div style={postCardStyles.authorInfoWrapper}>
                    <span style={postCardStyles.avatarPlaceholder}>V</span>
                    <div>
                        <p style={{...postCardStyles.author, color: authorColor, marginBottom: '0'}}>
                            {post.author?.email || 'Unknown Volunteer'} 
                        </p>
                        <p style={postCardStyles.timestamp}>
                             {isListView ? `Posted ${new Date(post.createdAt).toLocaleDateString()} ${new Date(post.createdAt).toLocaleTimeString()}` : 'just now'}
                        </p>
                    </div>
                </div>
                
                {/* Right Side: Follow/Message/Menu */}
                <div style={postCardStyles.actionWrapper}>
                    {!isAuthor && (
                        <>
                            <button onClick={handleFollowToggle} style={{...postCardStyles.followButton, backgroundColor: isFollowing ? '#7F8C8D' : '#3498DB', color: 'white', border: 'none'}}>
                                {isFollowing ? 'Following' : 'Follow'}
                            </button>
                            <button onClick={handleMessage} style={postCardStyles.messageButton}>
                                Message
                            </button>
                        </>
                    )}
                    {isAuthor && (
                        <div style={postCardStyles.menu}>
                            <button onClick={() => setIsEditing(true)} style={postCardStyles.menuButton}>Edit</button> 
                            <button onClick={handleDelete} style={postCardStyles.menuButton}>Delete</button>
                        </div>
                    )}
                </div>
            </div>
            
            {/* 💡 START: CONDITIONAL EDIT/VIEW RENDERING 💡 */}
            {isEditing ? (
                // --- 2. EDITING INTERFACE ---
                <div style={{marginBottom: '15px'}}>
                    <textarea 
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        style={postCardStyles.editArea}
                        placeholder="Edit your post content..."
                    />
                    <div style={postCardStyles.editActions}>
                        <button onClick={() => setIsEditing(false)} style={postCardStyles.cancelBtn}>
                            Cancel
                        </button>
                        <button onClick={handleSaveEdit} style={postCardStyles.saveBtn} disabled={!editText.trim()}>
                            Save Changes
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    {/* 2. POST TEXT (Regular View) */}
                    <p style={postCardStyles.textContent}>{post.content}</p>

                    {/* 3. MEDIA CONTENT (Image/Video) - The Fixed Display Location */}
                    {isListView && mediaSource && (
                        <div style={postCardStyles.mediaWrapper} onClick={handleDoubleClick}>
                            {mediaType === 'video' ? (
                                <video src={mediaSource} style={postCardStyles.mediaElement} controls autoPlay={false} />
                            ) : (
                                <img src={mediaSource} alt="Post Content" style={postCardStyles.mediaElement} />
                            )}
                        </div>
                    )}
                </>
            )}
            {/* 💡 END: CONDITIONAL EDIT/VIEW RENDERING 💡 */}

            {/* 4. ACTION BAR (Likes/Comments/Share - Horizontal, like Instagram) */}
            <div style={postCardStyles.actionBar}>
                
                {/* Like Button */}
                <button onClick={handleLikeToggle} style={postCardStyles.actionButton}>
                    <FaHeart style={{color: isLiked ? '#E74C3C' : iconColor, fontSize: '20px'}} />
                    <span style={postCardStyles.actionCount}>{likesCount}</span>
                </button>
                
                {/* Comment Button */}
                <button onClick={handleCommentToggle} style={postCardStyles.actionButton}>
                    <FaComment style={{color: iconColor, fontSize: '20px'}} />
                    <span style={postCardStyles.actionCount}>Comment</span>
                </button>
                
                {/* Share Button */}
                <button onClick={handleShare} style={postCardStyles.actionButton}>
                    <FaShare style={{color: iconColor, fontSize: '20px'}} />
                    <span style={postCardStyles.actionCount}>Share</span>
                </button>
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
    card: { 
        backgroundColor: '#fff', 
        borderRadius: '10px', 
        border: '1px solid #EAEAEA',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)', 
        padding: '20px', 
        width: '100%', 
        maxWidth: '700px', 
    },
    reelsCard: { /* Styles for vertical reel view */ },
    reelsImage: { /* Styles for reel background media */ },

    // --- 1. POST HEADER (Top Bar) ---
    postHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px',
        paddingBottom: '10px',
        borderBottom: '1px solid #F0F0F0',
    },
    authorInfoWrapper: {
        display: 'flex',
        alignItems: 'center',
    },
    avatarPlaceholder: {
        width: '35px',
        height: '35px',
        borderRadius: '50%',
        backgroundColor: '#9B59B6', 
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        fontSize: '16px',
        marginRight: '10px',
        flexShrink: 0,
    },
    author: { fontWeight: '600', margin: 0, fontSize: '15px' },
    timestamp: { fontSize: '12px', color: '#999', marginTop: '2px' },
    actionWrapper: {
        display: 'flex',
        gap: '10px',
        alignItems: 'center',
        flexShrink: 0,
    },
    followButton: {
        padding: '6px 12px',
        fontSize: '12px',
        fontWeight: 'bold',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
    },
    messageButton: {
        padding: '6px 12px',
        fontSize: '12px',
        fontWeight: 'bold',
        backgroundColor: '#ECF0F1',
        color: '#34495E',
        border: '1px solid #D9E0E7',
        borderRadius: '4px',
        cursor: 'pointer',
    },
    menuButton: { 
        background: 'none', 
        border: 'none', 
        color: '#7F8C8D', 
        cursor: 'pointer', 
        fontSize: '14px', 
        fontWeight: '500' 
    },

    // --- 2. MEDIA CONTENT ---
    mediaWrapper: {
        marginBottom: '15px',
        borderRadius: '6px',
        overflow: 'hidden',
        border: '1px solid #EEE',
        width: '100%',
        maxHeight: '500px',
        backgroundColor: '#000000', 
    },
    mediaElement: { 
        width: '100%', 
        height: 'auto', 
        maxHeight: '500px',
        objectFit: 'contain', 
        display: 'block',
    },

    // --- 3. POST TEXT ---
    textContent: {
        fontSize: '16px',
        color: '#34495E',
        marginBottom: '15px',
        whiteSpace: 'pre-wrap', 
    },

    // --- 4. ACTION BAR (Instagram-style) ---
    actionBar: {
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        paddingTop: '10px',
        borderTop: '1px dashed #F0F0F0',
    },
    actionButton: {
        display: 'flex',
        alignItems: 'center',
        background: 'none',
        border: 'none',
        padding: '0',
        cursor: 'pointer',
        color: '#7F8C8D',
        transition: 'color 0.2s',
    },
    actionCount: {
        marginLeft: '5px',
        fontSize: '14px',
        fontWeight: '500',
    },


    // --- COMMENT SECTION STYLES (unchanged) ---
    commentSection: { width: '100%', backgroundColor: '#2C3E50', padding: '15px', borderRadius: '8px', marginTop: '10px', maxHeight: '30vh', overflowY: 'auto', boxShadow: 'inset 0 0 5px rgba(0, 0, 0, 0.4)', color: '#ECF0F1', },
    commentHeader: { fontSize: '16px', color: '#ECF0F1', borderBottom: '1px solid #3A536B', paddingBottom: '5px', marginBottom: '15px', },
    commentInputWrapper: { display: 'flex', marginBottom: '15px', gap: '10px', alignItems: 'center', },
    commentInput: { flexGrow: 1, padding: '10px 15px', borderRadius: '25px', border: '1px solid #3A536B', backgroundColor: '#ECF0F1', color: '#2C3E50', outline: 'none', },
    commentPostButton: { backgroundColor: '#3498DB', color: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background-color 0.2s', flexShrink: 0, boxShadow: '0 2px 5px rgba(0, 0, 0, 0.3)', },
    placeholderComment: { fontSize: '14px', color: '#ECF0F1', marginBottom: '10px', padding: '5px 0', lineHeight: '1.4', },
    commentAuthor: { fontWeight: 'bold', color: '#ADD8E6', marginRight: '5px', },

    // --- Edit/Delete Styles (New) ---
    menu: { display: 'flex', gap: '10px' },
    editArea: { width: '100%', minHeight: '100px', marginBottom: '10px', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', resize: 'vertical' },
    editActions: { display: 'flex', justifyContent: 'flex-end', gap: '10px' },
    saveBtn: { backgroundColor: '#27AE60', color: 'white', padding: '8px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    cancelBtn: { backgroundColor: '#95A5A6', color: 'white', padding: '8px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer' }
};

export default PostCard;