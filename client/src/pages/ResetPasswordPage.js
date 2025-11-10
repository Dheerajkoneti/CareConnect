// client/src/pages/ResetPasswordPage.js (COMPLETE CODE)
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function ResetPasswordPage() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('Sending reset link...');

        try {
            // Target the correct backend endpoint
            await axios.post('/api/auth/request-password-reset', { email }); 
            
            setMessage('Success! A password reset link has been sent to your email.');
        } catch (error) {
            console.error("Reset Request Failed:", error.response?.data || error.message);
            setMessage('Error: Could not send reset link. Please check your email and try again.');
        }
    };

    return (
        <div style={styles.outerContainer}>
            <div style={styles.card}>
                <h2 style={styles.cardTitle}>Reset Your Password</h2>
                <p style={styles.cardDescription}>Enter your email address and we will send you a link to reset your password.</p>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <label style={styles.label}>Email</label>
                    <input 
                      type="email" 
                      placeholder="Your registered email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      required 
                      style={styles.input} 
                    />
                    <button type="submit" style={styles.button}>Send Reset Link</button>
                </form>
                
                {message && <p style={styles.message}>{message}</p>}

                <p style={styles.loginLink} onClick={() => navigate('/login')}>
                    Return to Login
                </p>
            </div>
        </div>
    );
}

const styles = {
    outerContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'linear-gradient(135deg, #e0e7fa 0%, #ffffff 100%)' },
    card: { backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)', maxWidth: '450px', width: '100%', textAlign: 'center' },
    cardTitle: { fontSize: '24px', color: '#6A1B9A', marginBottom: '10px' },
    cardDescription: { fontSize: '15px', color: '#777', marginBottom: '30px' },
    form: { display: 'flex', flexDirection: 'column', gap: '15px', textAlign: 'left' },
    label: { fontSize: '14px', fontWeight: 'bold', color: '#555', marginBottom: '5px' },
    input: { padding: '12px 15px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '16px', width: 'calc(100% - 30px)', boxSizing: 'border-box' },
    button: { padding: '14px 25px', backgroundColor: '#6A1B9A', color: 'white', border: 'none', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', marginTop: '20px' },
    message: { marginTop: '20px', padding: '10px', backgroundColor: '#E8F5E9', border: '1px solid #4CAF50', borderRadius: '4px', color: '#4CAF50' },
    loginLink: { marginTop: '15px', color: '#3498DB', cursor: 'pointer', textDecoration: 'underline' }
};

export default ResetPasswordPage; // <--- CRITICAL: FINAL DEFAULT EXPORT