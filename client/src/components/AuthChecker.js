// client/src/components/AuthChecker.js (Final Check Component)
import React from 'react';
import LandingPage from '../pages/LandingPage';
import DashboardHome from '../pages/DashboardHome'; // Correct authenticated landing page

const AuthChecker = () => {
    // Check local storage for the JWT token
    const isAuthenticated = localStorage.getItem('token');

    // CRITICAL LOGIC: If token exists, render the protected DashboardHome (the main hub),
    // otherwise, render the public LandingPage.
    return isAuthenticated ? <DashboardHome /> : <LandingPage />;
};

export default AuthChecker;