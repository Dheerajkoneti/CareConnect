// client/src/pages/FeedbackPage.js (FIXED: Unused handler resolved by connection)
import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function FeedbackPage() {
    const navigate = useNavigate();
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    // NOTE: 'handleSubmitFeedback' is used by the form's 'onSubmit'

    useEffect(() => {
        if (!localStorage.getItem('token')) {
            navigate('/login');
        }
    }, [navigate]);

    const handleSubmitFeedback = async (e) => {
        e.preventDefault();
        
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            
            await axios.post('/api/feedback', { rating, comment }, config);
            
            alert(`Feedback submitted! Rating: ${rating} stars. Thank you for your input!`);
            setRating(5);
            setComment('');
        } catch (error) {
            console.error("Error submitting feedback:", error);
            alert("Failed to submit feedback. Ensure backend route /api/feedback is running.");
        }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar />

            <div style={styles.contentArea}>
                <h1 style={styles.title}>❤️ Feedback & Support</h1>
                <p style={styles.subtitle}>Help us improve CareConnect for everyone.</p>

                <div style={styles.feedbackBox}>
                    <form onSubmit={handleSubmitFeedback}> {/* FIX: Handler is explicitly used here */}
                        <label style={styles.label}>Rate your overall experience:</label>
                        <div style={styles.ratingContainer}>
                            {[1, 2, 3, 4, 5].map(star => (
                                <span 
                                    key={star}
                                    style={{ cursor: 'pointer', fontSize: '30px', color: star <= rating ? '#FFC107' : '#E0E0E0' }}
                                    onClick={() => setRating(star)}
                                >
                                    ★
                                </span>
                            ))}
                        </div>

                        <label style={styles.label}>Your comments:</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Tell us what you loved or how we can improve..."
                            rows="4"
                            style={styles.textarea}
                        />
                        
                        <button type="submit" style={styles.submitButton}>Submit Feedback</button>
                    </form>
                    
                    <div style={styles.supportSection}>
                        <h4>Need Immediate Help?</h4>
                        <p>If you encounter issues, please email our support team.</p>
                        <a href="mailto:support@careconnect.com" style={styles.supportLink}>support@careconnect.com</a>
                    </div>
                </div>
            </div>
        </div>
    );
}

const styles = {
    contentArea: { flexGrow: 1, padding: '40px 30px', maxWidth: '800px', backgroundColor: '#f8f8fa' },
    title: { fontSize: '32px', color: '#6A1B9A', borderBottom: '2px solid #EEE', paddingBottom: '10px', marginBottom: '10px' },
    subtitle: { fontSize: '16px', color: '#555', marginBottom: '30px' },
    feedbackBox: { backgroundColor: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', textAlign: 'left' },
    label: { display: 'block', fontWeight: 'bold', marginTop: '15px', marginBottom: '5px', color: '#34495e' },
    ratingContainer: { marginBottom: '15px' },
    textarea: { width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '5px', resize: 'vertical' },
    submitButton: { padding: '10px 20px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '15px' },
    supportSection: { marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #eee' },
    supportLink: { color: '#3498DB', textDecoration: 'none', fontWeight: 'bold' }
};

export default FeedbackPage;