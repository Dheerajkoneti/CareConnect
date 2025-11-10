// client/src/pages/AdminDashboard.js (Minimal Working Code)
import React, { useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
    const navigate = useNavigate();
    const userName = localStorage.getItem('userName') || 'User';

    useEffect(() => {
        const userRole = localStorage.getItem('userRole');
        if (!localStorage.getItem('token') || userRole !== 'admin') {
            alert("Access Denied: Admin privileges required.");
            navigate('/dashboard');
        }
    }, [navigate]);

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar />
            <div style={styles.contentArea}>
                <h1 style={styles.title}>🔒 Admin Dashboard</h1>
                <p style={styles.subtitle}>Welcome, {userName}. Manage users, moderate content, and monitor AI usage.</p>
                <div style={styles.placeholder}>
                    [User Management and Analytics Tools Go Here]
                </div>
            </div>
        </div>
    );
}

const styles = {
    contentArea: { flexGrow: 1, padding: '40px 30px', maxWidth: '1200px', backgroundColor: '#f8f8fa' },
    title: { fontSize: '32px', color: '#E74C3C', borderBottom: '2px solid #F0F0F0', paddingBottom: '10px', marginBottom: '10px' },
    subtitle: { fontSize: '16px', color: '#555', marginBottom: '30px' },
    placeholder: { height: '500px', border: '2px dashed #ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white' }
};

export default AdminDashboard;