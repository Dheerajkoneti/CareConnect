import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { FaHeart, FaBed, FaAppleAlt, FaBrain, FaRunning, FaSun, FaSearch, FaPhone, FaGlobe } from 'react-icons/fa'; // Icons for visual appeal

// --- MOCK DATA ---
const initialResources = [
    {
        id: 1,
        name: "National Crisis Hotline",
        type: "Hotline",
        topic: "Crisis/Immediate",
        phone: "1-800-273-8255",
        description: "24/7 confidential support for people in distress, prevention, and crisis resources. Available nationwide.",
        color: "#E74C3C" // Red - Crisis
    },
    {
        id: 2,
        name: "Local Community Support Center",
        type: "NGO",
        topic: "Social/Local",
        address: "456 Oak St, City, State",
        website: "http://localcommunity.org",
        description: "Offers free local workshops, social gatherings, and peer support groups weekly for residents.",
        color: "#2980B9" // Blue - Social
    },
    {
        id: 3,
        name: "Virtual Mental Health Therapy",
        type: "Online Service",
        topic: "Counseling",
        website: "http://virtualtherapy.net",
        description: "Affordable virtual therapy sessions and mental health resources delivered by licensed professionals.",
        color: "#9B59B6" // Purple - Counseling
    },
    {
        id: 4,
        name: "Financial & Housing Aid",
        type: "Government Service",
        topic: "Practical Help",
        phone: "555-555-5555",
        description: "Directory for immediate housing assistance, unemployment, and financial aid programs.",
        color: "#2ECC71" // Green - Practical
    },
    {
        id: 5,
        name: "Addiction Recovery Network",
        type: "Support Group",
        topic: "Addiction",
        phone: "1-800-444-5555",
        description: "National network connecting individuals with local and virtual recovery meetings and sponsors.",
        color: "#F39C12" // Orange - Addiction
    },
];

// --- Resource Card Component ---
const ResourceCard = ({ resource }) => (
    <div style={styles.card}>
        <div style={{...styles.cardHeader, borderLeftColor: resource.color}}>
            <h3 style={styles.cardTitle}>{resource.name}</h3>
            <span style={{...styles.tag, backgroundColor: resource.color}}>{resource.type}</span>
        </div>
        
        <div style={styles.cardBody}>
            <p style={styles.cardTopic}>Topic: <strong>{resource.topic}</strong></p>
            <p style={styles.cardDescription}>{resource.description}</p>
        </div>
        
        <div style={styles.cardFooter}>
            {resource.phone && (
                <a href={`tel:${resource.phone}`} style={{...styles.contactButton, backgroundColor: '#3498DB'}}>
                    <FaPhone style={{marginRight: '8px'}} /> Call Now
                </a>
            )}
            {resource.website && (
                <a href={resource.website} target="_blank" rel="noopener noreferrer" style={{...styles.contactButton, backgroundColor: '#2ECC71'}}>
                    <FaGlobe style={{marginRight: '8px'}} /> Website
                </a>
            )}
            {resource.address && (
                <span style={styles.addressText}>📍 {resource.address}</span>
            )}
        </div>
    </div>
);

function ResourcesPage() {
    const [resources, setResources] = useState(initialResources);
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        
        const filtered = initialResources.filter(resource => 
            resource.name.toLowerCase().includes(term) ||
            resource.topic.toLowerCase().includes(term) ||
            resource.description.toLowerCase().includes(term) ||
            resource.type.toLowerCase().includes(term)
        );
        setResources(filtered);
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar />
            
            <div style={styles.contentArea}>
                
                {/* Header */}
                <h1 style={styles.pageTitle}>Community Resources 🤝</h1>
                <p style={styles.pageSubtitle}>Directory of helplines, NGOs, and local support services.</p>
                
                {/* Search Bar */}
                <div style={styles.searchContainer}>
                    <FaSearch style={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Filter by city, topic, or name..."
                        value={searchTerm}
                        onChange={handleSearch}
                        style={styles.searchInput}
                    />
                </div>

                {/* Resource List */}
                <div style={styles.resourcesGrid}>
                    {resources.length > 0 ? (
                        resources.map(resource => (
                            <ResourceCard key={resource.id} resource={resource} />
                        ))
                    ) : (
                        <p style={styles.noResults}>
                            No resources found for **"{searchTerm}"**. Try broadening your search!
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

const styles = {
    contentArea: { 
        flexGrow: 1, 
        padding: '40px 30px', 
        maxWidth: '1200px', 
        margin: '0 auto', 
        backgroundColor: '#f8f8fa', 
    },
    pageTitle: { 
        fontSize: '34px', 
        color: '#6A1B9A', // Primary Purple tone
        marginBottom: '5px',
        fontWeight: '800',
        textAlign: 'left',
    },
    pageSubtitle: {
        fontSize: '16px',
        color: '#7F8C8D',
        marginBottom: '20px',
        textAlign: 'left',
    },
    searchContainer: {
        marginBottom: '30px',
        textAlign: 'left',
        position: 'relative',
    },
    searchIcon: {
        position: 'absolute',
        left: '15px',
        top: '50%',
        transform: 'translateY(-50%)',
        color: '#7F8C8D',
        fontSize: '18px',
        zIndex: 5,
    },
    searchInput: {
        width: '100%',
        padding: '12px 20px 12px 45px', // Added left padding for the icon
        borderRadius: '8px',
        border: '1px solid #ddd',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        fontSize: '16px',
        transition: 'border-color 0.2s',
        outline: 'none',
    },
    resourcesGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '25px',
        paddingTop: '10px',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: '10px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        transition: 'transform 0.2s, border-color 0.2s',
        textAlign: 'left',
        border: '1px solid #f0f0f0',
        // Hover effect
        '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
        }
    },
    cardHeader: {
        padding: '15px 20px',
        borderLeft: '5px solid',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F7F9FC',
    },
    cardTitle: {
        fontSize: '18px',
        color: '#34495E',
        margin: 0,
        fontWeight: 'bold',
    },
    tag: {
        fontSize: '12px',
        color: 'white',
        padding: '4px 8px',
        borderRadius: '4px',
        fontWeight: 600,
        textTransform: 'uppercase',
    },
    cardBody: {
        padding: '15px 20px',
    },
    cardTopic: {
        fontSize: '14px',
        color: '#7F8C8D',
        marginBottom: '5px',
    },
    cardDescription: {
        fontSize: '14px',
        color: '#34495E',
        marginBottom: '15px',
        minHeight: '40px',
    },
    cardFooter: {
        padding: '15px 20px',
        borderTop: '1px solid #ECF0F1',
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
        gap: '15px',
    },
    contactButton: {
        backgroundColor: '#2980B9',
        color: 'white',
        padding: '8px 15px',
        borderRadius: '5px',
        textDecoration: 'none',
        fontSize: '14px',
        fontWeight: 'bold',
        transition: 'background-color 0.2s',
        display: 'flex',
        alignItems: 'center',
    },
    addressText: {
        fontSize: '14px',
        color: '#555',
    },
    noResults: {
        textAlign: 'center',
        color: '#7F8C8D',
        fontSize: '18px',
        gridColumn: '1 / -1',
        padding: '50px 0',
    }
};

export default ResourcesPage;
