// client/src/pages/RegisterPage.js (FINAL & FIXED)
import React, { useState } from 'react';
import api from "../utils/axiosInstance";
import axios from "../utils/axiosInstance";
import { useNavigate } from 'react-router-dom';
import { FaGoogle, FaHeart } from 'react-icons/fa';
import axios from "axios";

const ACCENT_PURPLE = '#6A1B9A';
const LIGHT_BACKGROUND = '#F0F4F7';

function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('community_member');
  const [age, setAge] = useState('');
  const [location, setLocation] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    try {
      const response = await api.post(
  "/api/auth/register",
  {
    fullName,
    email,
    password,
    role,
    age: age ? parseInt(age) : undefined,
    location,
  }
);

      console.log('✅ Registration Success:', response.data);

      // ✅ Save user info to localStorage (for Sidebar, Dashboard)
      localStorage.setItem('userName', fullName);
      localStorage.setItem('userEmail', email);
      localStorage.setItem('role', role);
      if (response.data.userId) {
        localStorage.setItem('userId', response.data.userId);
      }

      alert('Registration successful! You can now log in.');
      navigate('/login');
    } catch (error) {
      const errorMessage = error.response
        ? error.response.data.message
        : 'Registration failed. Server error.';
      console.error('❌ Registration Failed:', errorMessage);
      alert(errorMessage);
    }
  };

  const handleSocialRegister = () => {
    window.location.href =
  `${process.env.REACT_APP_API_URL}/api/auth/google`;
  };

  return (
    <div style={styles.outerContainer}>
      {/* LEFT COLUMN: Registration Form */}
      <div style={styles.leftPanel}>
        <div style={styles.logoContainer}>
          <FaHeart size={28} style={styles.heartIcon} />
          <h1 style={styles.logo}>CareConnect</h1>
        </div>

        <h2 style={styles.leftHeader}>Create your account</h2>

        <p style={styles.loginLink}>
          Have an account?{' '}
          <span onClick={() => navigate('/login')} style={styles.loginText}>
            Log in now
          </span>
        </p>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Full Name</label>
          <input
            type="text"
            placeholder="Your full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            style={styles.input}
          />

          <label style={styles.label}>Email Address</label>
          <input
            type="email"
            placeholder="We recommend using your work email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />

          <label style={styles.label}>Password</label>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
          />

          <label style={styles.label}>Confirm Password</label>
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            style={styles.input}
          />

          {/* Role Selection */}
          <label style={styles.label}>Join as:</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={styles.input}
          >
            <option value="community_member">Community Member</option>
            <option value="volunteer">Volunteer</option>
          </select>

          {/* Optional Fields */}
          <div style={styles.optionalFields}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Age (Optional)</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                style={styles.input}
              />
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Location (Optional)</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                style={styles.input}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            style={styles.submitButton}
            onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.98)')}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1.0)')}
          >
            Create Account
          </button>
        </form>

        <p style={styles.termsText}>
          By creating an account, you agree to our terms of service and privacy policy.
        </p>
      </div>

      {/* RIGHT COLUMN: Branding Section */}
      <div style={styles.rightPanel}>
        <h2 style={styles.rightHeader}>Bridging Loneliness Through Digital Care</h2>
        <p style={styles.rightText}>
          Connect with our dedicated community of volunteers and peers for
          personalized emotional support.
        </p>
        <button
          style={styles.rightCtaButton}
          onClick={() => navigate('/login')}
        >
          Return to Login →
        </button>
      </div>
    </div>
  );
}

const styles = {
  outerContainer: {
    display: 'flex',
    minHeight: '100vh',
    width: '100vw',
    backgroundColor: LIGHT_BACKGROUND,
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
    marginBottom: '20px',
  },
  heartIcon: { color: ACCENT_PURPLE, marginRight: '8px' },
  logo: { fontSize: '24px', color: ACCENT_PURPLE, fontWeight: 'bold' },
  leftHeader: {
    fontSize: '28px',
    color: '#333',
    marginBottom: '15px',
    fontWeight: '600',
    alignSelf: 'flex-start',
    marginLeft: '20%',
  },
  loginLink: {
    fontSize: '15px',
    color: '#777',
    marginBottom: '20px',
    alignSelf: 'flex-start',
    marginLeft: '20%',
  },
  loginText: { color: ACCENT_PURPLE, fontWeight: 'bold', cursor: 'pointer' },
  googleButtonContainer: { width: '60%', maxWidth: '350px', marginBottom: '20px' },
  googleButton: {
    width: '100%',
    padding: '12px',
    backgroundColor: 'white',
    border: '1px solid #ccc',
    borderRadius: '5px',
    fontSize: '15px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    color: '#555',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
  },
  googleIcon: { color: '#DB4437', marginRight: '10px' },
  orSeparator: {
    width: '60%',
    textAlign: 'center',
    fontSize: '14px',
    color: '#777',
    marginBottom: '20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    width: '60%',
    maxWidth: '350px',
  },
  label: { fontSize: '14px', color: '#555', marginBottom: '2px' },
  input: {
    padding: '12px 10px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '16px',
    backgroundColor: '#f9f9f9',
  },
  optionalFields: { display: 'flex', gap: '15px' },
  fieldGroup: { flex: '1', display: 'flex', flexDirection: 'column' },
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
    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
  },
  termsText: {
    fontSize: '12px',
    color: '#777',
    marginTop: '15px',
    textAlign: 'center',
    width: '60%',
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
  rightText: {
    fontSize: '18px',
    lineHeight: '1.6',
    marginBottom: '40px',
    maxWidth: '450px',
  },
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
};

export default RegisterPage;
