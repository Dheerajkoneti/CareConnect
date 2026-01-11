// client/src/pages/LoginPage.js (FINAL UPDATED VERSION)
import React, { useState } from 'react';
import api from "../utils/axiosInstance";
import { useNavigate } from 'react-router-dom';
import { FaHeart } from 'react-icons/fa';
function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const navigate = useNavigate();

  // ✅ Handles main login
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post(
      "/api/auth/login",
      { email, password }
      );
      const user = response.data.user;
      if (!user) throw new Error("User data missing from response");

      // ✅ Store all user info for profile and other pages
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userId', user._id);
      localStorage.setItem("userName", response.data.user.fullName);
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem('userRole', user.role);

      console.log('✅ Login successful. Redirecting to dashboard...');
      navigate('/dashboard'); // Redirect to dashboard or root
    } catch (error) {
      const msg = error.response ? error.response.data.message : 'Login failed. Please try again.';
      console.error('❌ Login Error:', msg);
      alert(msg);
    }
  };

  // ✅ Forgot password modal handler
  const handleForgotPassword = () => setIsResetMode(true);

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (!resetEmail.trim()) return alert('Please enter your registered email.');

    alert('Sending reset link... Please check your inbox.');

    try {
      const response = await api.post(
        "/api/auth/request-password-reset",
        { email: resetEmail }
      );
      alert(response.data.message || 'Password reset email sent successfully.');
      setIsResetMode(false);
    } catch (error) {
      console.error('Password reset failed:', error);
      alert('Unable to send reset link. Please ensure backend/email service is running.');
    }
  };
  // ✅ Google login redirect
  const handleGoogleSignIn = () => {
    window.location.href =
   `${process.env.REACT_APP_API_URL}/api/auth/google`;
  };
  return (
    <div style={styles.outerContainer}>
      {/* LEFT PANEL — LOGIN FORM */}
      <div style={styles.leftPanel}>
        <div style={styles.logoContainer}>
          <FaHeart size={28} style={styles.heartIcon} />
          <h1 style={styles.logo}>CareConnect</h1>
        </div>
        <h2 style={styles.leftHeader}>Log in to your account</h2>
        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Email Address</label>
          <input
            type="email"
            placeholder="name@university.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />

          <label style={styles.label}>Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
          />

          <div style={styles.forgotPasswordContainer}>
            <span onClick={handleForgotPassword} style={styles.forgotPasswordLink}>
              Forgot Password?
            </span>
          </div>

          <button type="submit" style={styles.submitButton}>
            Sign In
          </button>
        </form>

        <p style={styles.signUpLink}>
          Don't have an account?{' '}
          <span onClick={() => navigate('/register')} style={styles.link}>
            Sign Up
          </span>
        </p>

        {/* --- RESET PASSWORD MODAL --- */}
        {isResetMode && (
          <div style={styles.resetModalOverlay}>
            <form onSubmit={handleResetSubmit} style={styles.resetModalContent}>
              <span onClick={() => setIsResetMode(false)} style={styles.resetCloseButton}>
                &times;
              </span>
              <h3 style={styles.resetHeader}>Reset Password</h3>
              <p style={styles.resetDescription}>
                Enter your registered email to receive a secure reset link.
              </p>

              <label style={styles.label}>Registered Email</label>
              <input
                type="email"
                placeholder="Email address"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
                style={styles.input}
              />
              <button type="submit" style={styles.resetButton}>
                Send Link
              </button>
            </form>
          </div>
        )}
      </div>

      {/* RIGHT PANEL — MISSION STATEMENT */}
      <div style={styles.rightPanel}>
        <h2 style={styles.rightHeader}>Bridging Loneliness Through Digital Care</h2>
        <p style={styles.rightText}>
          Connect with our dedicated community of volunteers and peers for personalized emotional
          support.
        </p>
        <button
          style={styles.rightCtaButton}
          onClick={() => navigate('/register')}
        >
          Learn More About Our Mission →
        </button>
      </div>
    </div>
  );
}

const ACCENT_PURPLE = '#6A1B9A';
const ACCENT_GREEN = '#4CAF50';

const styles = {
  outerContainer: {
    display: 'flex',
    minHeight: '100vh',
    width: '100vw',
  },
  leftPanel: {
    width: '50%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '50px 20px',
    backgroundColor: 'white',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginLeft: '20%',
    marginBottom: '40px',
  },
  heartIcon: { color: ACCENT_PURPLE, marginRight: '8px' },
  logo: { fontSize: '24px', color: ACCENT_PURPLE, fontWeight: 'bold' },
  leftHeader: {
    fontSize: '28px',
    color: '#333',
    marginBottom: '20px',
    alignSelf: 'flex-start',
    marginLeft: '20%',
    fontWeight: '600',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    width: '60%',
    maxWidth: '350px',
    textAlign: 'left',
  },
  label: { fontSize: '14px', color: '#555', marginBottom: '2px' },
  input: {
    padding: '12px 10px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '16px',
    backgroundColor: '#f9f9f9',
  },
  submitButton: {
    padding: '12px 25px',
    backgroundColor: ACCENT_PURPLE,
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '20px',
  },
  forgotPasswordContainer: { textAlign: 'right', marginTop: '5px' },
  forgotPasswordLink: { fontSize: '14px', color: ACCENT_PURPLE, cursor: 'pointer' },
  signUpLink: { marginTop: '30px', fontSize: '14px', color: '#555' },
  link: { color: ACCENT_GREEN, fontWeight: 'bold', cursor: 'pointer' },
  googleButtonContainer: { width: '60%', maxWidth: '350px', marginBottom: '20px' },
  googleButton: {
    width: '100%',
    padding: '10px',
    backgroundColor: 'white',
    border: '1px solid #ccc',
    borderRadius: '5px',
    fontSize: '15px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    color: '#555',
  },
  orSeparator: {
    width: '60%',
    textAlign: 'center',
    fontSize: '14px',
    color: '#777',
    margin: '10px 0 20px 0',
  },
  rightPanel: {
    width: '50%',
    backgroundColor: ACCENT_PURPLE,
    padding: '50px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    color: 'white',
    boxShadow: '-5px 0 15px rgba(0,0,0,0.2)',
  },
  rightHeader: {
    fontSize: '36px',
    color: '#FFD700',
    marginBottom: '20px',
    fontWeight: '700',
  },
  rightText: { fontSize: '18px', lineHeight: '1.6', marginBottom: '40px', maxWidth: '450px' },
  rightCtaButton: {
    padding: '12px 30px',
    backgroundColor: 'transparent',
    border: '2px solid white',
    color: 'white',
    borderRadius: '5px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    maxWidth: '250px',
  },
  resetModalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  resetModalContent: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '10px',
    width: '80%',
    maxWidth: '400px',
    position: 'relative',
  },
  resetCloseButton: {
    position: 'absolute',
    top: '10px',
    right: '15px',
    fontSize: '24px',
    cursor: 'pointer',
  },
  resetHeader: { fontSize: '22px', color: ACCENT_PURPLE, marginBottom: '10px', textAlign: 'center' },
  resetDescription: { fontSize: '14px', color: '#777', marginBottom: '20px', textAlign: 'center' },
  resetButton: {
    padding: '12px 20px',
    backgroundColor: ACCENT_GREEN,
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    width: '100%',
    cursor: 'pointer',
  },
};

export default LoginPage;
