// client/src/components/FollowersModal.js

import React from 'react';

const modalStyles = {
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.7)', zIndex: 1000 },
    modal: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'white', padding: '20px', borderRadius: '8px', minWidth: '300px', maxHeight: '80vh', overflowY: 'auto' },
    header: { display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '10px' },
    list: { listStyle: 'none', padding: 0 },
    listItem: { padding: '10px 0', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
};

const FollowersModal = ({ isOpen, onClose, list, title, loading }) => {
    if (!isOpen) return null;

    return (
        <div style={modalStyles.overlay} onClick={onClose}>
            <div style={modalStyles.modal} onClick={e => e.stopPropagation()}>
                <div style={modalStyles.header}>
                    <h2>{title} ({list.length})</h2>
                    <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer' }}>&times;</button>
                </div>
                
                {loading && <p>Loading list...</p>}
                
                {!loading && list.length === 0 && <p>No {title.toLowerCase()} found.</p>}

                {!loading && list.length > 0 && (
                    <ul style={modalStyles.list}>
                        {list.map(item => (
                            // Assuming each item has an id and a name
                            <li key={item.id} style={modalStyles.listItem}>
                                <span>{item.name || item.email || 'Unknown User'}</span>
                                {/* Add a button or link to view profile/unfollow */}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default FollowersModal;