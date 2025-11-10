import React, { useState, useRef } from 'react';
import axios from 'axios';
// Assuming you have a Multer configuration set up on your backend Express server
// and a route for POST /api/posts

const CreatePostFormStyles = {
    formContainer: { backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', marginBottom: '20px' },
    textArea: { width: '100%', minHeight: '80px', padding: '10px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '4px', resize: 'vertical' },
    footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    fileInputWrapper: { position: 'relative', overflow: 'hidden', display: 'inline-block' },
    fileInputLabel: { border: '1px solid #ccc', padding: '8px 12px', cursor: 'pointer', borderRadius: '4px', backgroundColor: '#f4f4f4', fontSize: '14px' },
    fileText: { marginLeft: '10px', fontSize: '14px', color: '#555' },
    submitButton: { backgroundColor: '#3498DB', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', transition: 'background-color 0.3s' },
    postDetails: { fontSize: '12px', color: '#777', marginBottom: '5px' },
};

function CreatePostForm({ onPostCreated }) {
    const [postText, setPostText] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef(null);

    const token = localStorage.getItem('token');

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 🛑 FIX VALIDATION: Allow posting if EITHER text OR media is present
        if (!postText.trim() && !selectedFile) {
            alert("Post must contain text or a media file.");
            return;
        }

        setIsSubmitting(true);
        const config = { 
            headers: { 
                Authorization: `Bearer ${token}`,
                // IMPORTANT: When uploading a file, the content type must be multipart/form-data
                'Content-Type': 'multipart/form-data' 
            } 
        };

        const formData = new FormData();
        formData.append('content', postText);
        if (selectedFile) {
            formData.append('media', selectedFile); // 'media' must match your Multer field name
        }

        try {
            const response = await axios.post('/api/posts', formData, config);
            
            // Call prop function to update the feed state in CommunityFeed.js
            onPostCreated(response.data); 

            // Reset form fields
            setPostText('');
            setSelectedFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = null;
            }
            
        } catch (error) {
            const errorMessage = error.response ? error.response.data.message : 'Post failed. Check server/upload limits.';
            console.error('Post Creation Failed:', errorMessage, error);
            alert(`Failed to create post: ${errorMessage}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={CreatePostFormStyles.formContainer}>
            <textarea
                style={CreatePostFormStyles.textArea}
                placeholder="Share an update or ask for support..."
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                disabled={isSubmitting}
            />

            <div style={CreatePostFormStyles.footer}>
                <div style={CreatePostFormStyles.fileInputWrapper}>
                    <input
                        type="file"
                        id="file-upload"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                        accept="image/*,video/*"
                        disabled={isSubmitting}
                    />
                    <label htmlFor="file-upload" style={CreatePostFormStyles.fileInputLabel}>
                        Choose File
                    </label>
                    <span style={CreatePostFormStyles.fileText}>
                        {selectedFile ? selectedFile.name : 'No file chosen'}
                    </span>
                </div>

                <button 
                    type="submit" 
                    style={CreatePostFormStyles.submitButton}
                    disabled={isSubmitting || (!postText.trim() && !selectedFile)}
                >
                    {isSubmitting ? 'Posting...' : 'Post to Community'}
                </button>
            </div>
            {selectedFile && (
                <p style={CreatePostFormStyles.postDetails}>
                    Selected: {selectedFile.type.startsWith('video') ? 'Video' : 'Image'} ({Math.round(selectedFile.size / 1024)} KB)
                </p>
            )}
        </form>
    );
}

export default CreatePostForm;