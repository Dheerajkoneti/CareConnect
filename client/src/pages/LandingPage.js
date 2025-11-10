// Landing Page Component (FINAL WITH NAVIGATION)
import React, { useState } from 'react';
// 💡 CRITICAL: Import useNavigate to handle routing
import { useNavigate } from 'react-router-dom'; 

// --- Feature Data (UNCHANGED) ---
const topFeatures = [
    { title: "AI Companion Chat", description: "Get instant emotional support from our AI-powered chatbot with sentiment analysis.", icon: 'Chat', color: '#9B59B6', },
    { title: "Community Feed", description: "Share experiences, join discussions, and connect with others who understand.", icon: 'Users', color: '#3498DB', },
    { title: "Virtual Events", description: "Join group activities, workshops, and social gatherings online.", icon: 'Calendar', color: '#2ECC71', },
];
const bottomFeatures = [
    { title: "Support Requests", description: "Request specific help and connect with volunteers ready to assist.", icon: 'Shield', color: '#E74C3C', },
    { title: "Wellness Tips", description: "Access mental health resources and daily wellness guidance.", icon: 'Star', color: '#F39C12', },
    { title: "Volunteer Network", description: "Connect with caring volunteers who provide companionship and support.", icon: 'Network', color: '#8E44AD', },
];
const whoWeServe = [
    { title: "Elderly Living Alone", description: "Seniors in rural areas with limited access to social networks and family support.", icon: '👵', },
    { title: "Students Away From Home", description: "Young adults studying in new cities who may feel isolated and lonely.", icon: '🎓', },
    { title: "Remote Workers", description: "Professionals working from home who miss workplace social connections.", icon: '💻', },
];

// --- Custom Component for Feature Box with Hover State (UNCHANGED) ---
const FeatureBox = ({ feature, isServing }) => {
    const [isHovered, setIsHovered] = useState(false);
    
    const baseStyle = isServing ? styles.serveBox : styles.featureBox;

    const combinedStyle = {
        ...baseStyle,
        transform: isHovered ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: isHovered ? '0 12px 20px rgba(0,0,0,0.1)' : baseStyle.boxShadow,
        borderColor: isHovered && !isServing ? feature.color : baseStyle.borderColor,
    };
    
    const DynamicIcon = ({ color, name }) => (
        <svg width="32" height="32" viewBox="0 0 24 24" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none">
            {/* AI Companion Chat: Speech Bubble */}
            {name === 'AI' && <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />}
            
            {/* Community Feed: Users (simplified people icon) */}
            {name === 'Community' && 
                <>
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M17 7h-2.5l-2.5-2.5L14 3h5a2 2 0 0 1 2 2v5l-1.5-1.5L17 7z"/>
                </>
            }
            
            {/* Virtual Events: Calendar */}
            {name === 'Virtual' && 
                <>
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                </>
            }
            
            {/* Support Requests: Shield */}
            {name === 'Support' && <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>}
            
            {/* Wellness Tips: Star/Sparkle */}
            {name === 'Wellness' && 
                <>
                    <line x1="12" y1="2" x2="12" y2="6"/>
                    <line x1="12" y1="18" x2="12" y2="22"/>
                    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/>
                    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
                    <line x1="2" y1="12" x2="6" y2="12"/>
                    <line x1="18" y1="12" x2="22" y2="12"/>
                </>
            }
            
            {/* Volunteer Network: Network/Users */}
            {name === 'Volunteer' && 
                <>
                    <circle cx="12" cy="7" r="4"/>
                    <path d="M12 17v5"/>
                    <path d="M6 15l-1.5 5"/>
                    <path d="M18 15l1.5 5"/>
                </>
            }
        </svg>
    );

    return (
        <div 
            style={combinedStyle}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {!isServing ? (
                <div style={{...styles.iconWrapper, borderColor: feature.color, transition: 'all 0.2s'}}>
                    <DynamicIcon color={feature.color} name={feature.title.split(' ')[0]} />
                </div>
            ) : (
                <div style={styles.serveIconPlaceholder}>
                    {feature.icon}
                </div>
            )}
            
            <h3 style={styles.featureTitle}>{feature.title}</h3>
            <p style={styles.featureDescription}>{feature.description}</p>
        </div>
    );
};


const LandingPage = () => {
    // 💡 CRITICAL: Initialize the navigate hook
    const navigate = useNavigate(); 
    
    // --- Custom Component for Action Button with Hover State (UNCHANGED) ---
    const ActionButton = ({ children, isPrimary, onClick }) => {
        const [isBtnHovered, setIsBtnHovered] = useState(false);
        
        const baseBtnStyle = isPrimary ? styles.primaryActionButton : styles.secondaryActionButton;
        
        const combinedBtnStyle = {
            ...baseBtnStyle,
            backgroundColor: isPrimary ? (isBtnHovered ? '#000000' : '#34495e') : (isBtnHovered ? '#F0F0F0' : 'white'),
            color: isPrimary ? 'white' : '#34495e',
            
            transform: isBtnHovered ? 'translateY(-1px)' : 'translateY(0)',
            boxShadow: isBtnHovered ? '0 6px 12px rgba(0,0,0,0.3)' : baseBtnStyle.boxShadow,
            border: isPrimary ? 'none' : '1px solid #BDC3C7',
        };

        return (
            <button 
                style={combinedBtnStyle}
                onMouseEnter={() => setIsBtnHovered(true)}
                onMouseLeave={() => setIsBtnHovered(false)}
                onClick={onClick}
            >
                {children}
            </button>
        );
    };

    
    return (
        <div style={styles.container}>
            
            {/* Header (UNCHANGED) */}
            <header style={styles.header}>
                <div style={styles.logoContainer}>
                    <span style={styles.logoIcon}>💜</span>
                    <span style={styles.logoText}>CareConnect</span>
                </div>
                <div style={styles.authButtons}>
                    <button style={styles.loginButton} onClick={() => navigate('/login')}>Login</button>
                    <button style={styles.getStartedButton} onClick={() => navigate('/register')}>Get Started</button>
                </div>
            </header>

            {/* Hero Section (UNCHANGED) */}
            <section style={styles.heroSection}>
                <h1 style={styles.heroTitle}>
                    Bridging Loneliness Through <span style={styles.highlightText}>Digital Care</span>
                </h1>
                <p style={styles.heroSubtitle}>
                    A community-driven platform where people can connect, share, and support each 
                    other in a safe digital environment. No one needs to suffer in silence.
                </p>
                <div style={styles.heroActions}>
                    <ActionButton isPrimary={true} onClick={() => navigate('/register')}>Join Our Community</ActionButton>
                    <ActionButton isPrimary={false} onClick={() => alert('Navigate to Learn More section/page')}>Learn More</ActionButton>
                </div>
            </section>
            
            {/* How CareConnect Helps Section (UNCHANGED) */}
            <section style={styles.featuresSection}>
                <h2 style={styles.sectionTitle}>How CareConnect Helps</h2>
                <p style={styles.sectionSubtitle}>
                    Our platform provides multiple ways to connect and receive support
                </p>
                <div style={styles.featuresGrid}>
                    {topFeatures.map((feature, index) => (<FeatureBox key={`top-${index}`} feature={feature} isServing={false} />))}
                </div>
                <div style={styles.featuresGrid}>
                    {bottomFeatures.map((feature, index) => (<FeatureBox key={`bottom-${index}`} feature={feature} isServing={false} />))}
                </div>
            </section>
            
            {/* Who We Serve Section (UNCHANGED) */}
            <section style={styles.whoWeServeSection}>
                <h2 style={styles.sectionTitle}>Who We Serve</h2>
                <p style={styles.sectionSubtitle}>
                    Our platform is designed to support those who need it most
                </p>
                <div style={styles.serveGrid}>
                    {whoWeServe.map((item, index) => (<FeatureBox key={`serve-${index}`} feature={item} isServing={true} />))}
                </div>
            </section>

            {/* Ready to Make a Connection Banner */}
            <div style={styles.readyBanner}>
                <h2 style={styles.bannerTitle}>Ready to Make a Connection?</h2>
                <p style={styles.bannerSubtitle}>Join our community today and start your journey toward better mental wellness and social connection.</p>
                {/* 💡 FIX: Attach the navigation handler to the banner button */}
                <button style={styles.bannerButton} onClick={() => navigate('/register')}>Get Started Now</button>
            </div>

            {/* Footer Section (UNCHANGED) */}
            <footer style={styles.footer}>
                <div style={styles.footerContent}>
                    <div style={styles.logoContainer}>
                        <span style={styles.logoIcon}>💜</span>
                        <span style={styles.footerLogoText}>CareConnect</span>
                    </div>
                    <p style={styles.copyrightText}>
                        Bridging loneliness through Digital Care
                    </p>
                    <p style={styles.copyrightText}>
                        © 2025 CareConnect. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
};

// --- Styles ---
const styles = {
    container: {
        fontFamily: 'Arial, sans-serif',
        textAlign: 'center',
        backgroundColor: '#F7F9FC',
        minHeight: '100vh',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '15px 50px',
        backgroundColor: 'white',
        boxShadow: '0 1px 5px rgba(0,0,0,0.05)',
    },
    logoContainer: {
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
    },
    logoIcon: {
        fontSize: '24px',
        marginRight: '5px',
        color: '#9B59B6', 
    },
    logoText: {
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#34495E',
    },
    footerLogoText: {
        fontSize: '18px',
        fontWeight: 'bold',
        color: 'white',
    },
    authButtons: {
        display: 'flex',
        gap: '10px',
    },
    loginButton: {
        backgroundColor: 'transparent',
        border: 'none',
        color: '#34495E',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 'bold',
    },
    getStartedButton: {
        backgroundColor: '#34495E',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        padding: '8px 15px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 'bold',
    },
    // 🎯 HERO SECTION STYLES
    heroSection: {
        padding: '100px 20px 80px',
        background: 'radial-gradient(circle at center, #FFFFFF 0%, #E6EAF0 100%)', 
    },
    heroTitle: {
        fontSize: '44px',
        color: '#34495E',
        fontWeight: 700,
        marginBottom: '20px',
        maxWidth: '800px',
        margin: '0 auto 20px',
    },
    highlightText: {
        color: '#9B59B6', 
    },
    heroSubtitle: {
        fontSize: '16px', 
        color: '#4B5563', 
        maxWidth: '600px',
        margin: '0 auto 40px',
        lineHeight: 1.6,
    },
    heroActions: {
        display: 'flex',
        justifyContent: 'center',
        gap: '10px',
    },
    // --- ACTION BUTTON BASE STYLES ---
    primaryActionButton: {
        padding: '10px 20px', 
        borderRadius: '4px',
        fontSize: '16px',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.3s',
        boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
    },
    secondaryActionButton: {
        padding: '10px 20px', 
        borderRadius: '4px',
        fontSize: '16px',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.3s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #BDC3C7',
    },
    // --- FEATURE SECTION STYLES ---
    featuresSection: {
        padding: '60px 20px',
        backgroundColor: 'white',
    },
    sectionTitle: {
        fontSize: '28px',
        color: '#34495E',
        marginBottom: '10px',
        fontWeight: 600,
    },
    sectionSubtitle: {
        fontSize: '16px',
        color: '#7F8C8D',
        marginBottom: '40px',
    },
    featuresGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: '25px',
        maxWidth: '1100px',
        margin: '0 auto 25px', 
    },
    featureBox: {
        backgroundColor: 'white',
        border: '1px solid #ECF0F1',
        borderRadius: '10px',
        padding: '30px',
        textAlign: 'center',
        boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
        transition: 'all 0.2s', // Enable transition for hover
        minHeight: '180px', 
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        borderColor: '#ECF0F1', // Base border color
    },
    iconWrapper: {
        fontSize: '36px',
        marginBottom: '10px', 
        height: '40px',
        width: '40px',
        borderRadius: '50%',
        backgroundColor: 'white', 
        border: '2px solid', // Use border to create the circle ring
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s',
    },
    serveIconPlaceholder: { // For Who We Serve section
        fontSize: '24px',
        marginBottom: '10px',
    },
    featureTitle: {
        fontSize: '16px', 
        fontWeight: 600,
        color: '#34495E',
        marginBottom: '5px', 
    },
    featureDescription: {
        fontSize: '13px', 
        color: '#7F8C8D',
        lineHeight: 1.4,
    },
    // --- WHO WE SERVE STYLES ---
    whoWeServeSection: {
        padding: '60px 20px',
        backgroundColor: '#F7F9FC',
    },
    serveGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: '25px',
        maxWidth: '900px',
        margin: '0 auto',
    },
    serveBox: {
        backgroundColor: 'white',
        padding: '20px',
        border: '1px solid #ECF0F1',
        borderRadius: '10px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
        transition: 'all 0.2s', // Enable transition for hover
        minHeight: '120px',
        borderColor: '#ECF0F1', // Base border color
    },
    // --- BANNER & FOOTER STYLES ---
    readyBanner: {
        backgroundColor: '#9B59B6', 
        padding: '60px 20px',
        color: 'white',
    },
    bannerTitle: {
        fontSize: '30px',
        fontWeight: 700,
        marginBottom: '15px',
    },
    bannerSubtitle: {
        fontSize: '18px',
        marginBottom: '30px',
        maxWidth: '600px',
        margin: '0 auto 30px',
    },
    bannerButton: {
        backgroundColor: 'white',
        color: '#9B59B6',
        border: 'none',
        borderRadius: '8px',
        padding: '12px 30px',
        fontSize: '18px',
        fontWeight: 600,
        cursor: 'pointer',
    },
    footer: {
        backgroundColor: '#34495E', 
        padding: '40px 20px',
        color: 'white',
    },
    footerContent: {
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    copyrightText: {
        fontSize: '12px',
        color: '#BDC3C7',
        margin: '5px 0',
    },
};

export default LandingPage;