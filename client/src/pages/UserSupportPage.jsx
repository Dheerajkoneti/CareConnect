import React, { useState, useEffect } from 'react';
import socket from '../utils/socket';
import MatchPopup from '../components/MatchPopup';
import ChatBox from '../components/ChatBox';

export default function UserSupportPage() {
  const [status, setStatus] = useState('idle');
  const [volunteer, setVolunteer] = useState(null);
  const [sessionRoom, setSessionRoom] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);

  const requestSupport = () => {
    socket.emit('user_request_support', { id: 'user001', name: 'Elderly User' });
    setStatus('searching');
  };

  useEffect(() => {
    socket.on('match_found', ({ room, volunteer }) => {
      setVolunteer(volunteer);
      setSessionRoom(room);
      setStatus('matched');
    });

    socket.on('no_volunteer_available', () => setStatus('unavailable'));

    return () => {
      socket.off('match_found');
      socket.off('no_volunteer_available');
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {status === 'idle' && (
        <button 
          onClick={requestSupport}
          className="px-6 py-3 bg-purple-700 text-white font-semibold rounded-lg shadow-lg hover:bg-purple-800 transition"
        >
          💬 Need Support
        </button>
      )}

      {status === 'searching' && (
        <p className="text-lg text-gray-700 animate-pulse mt-4">
          🔍 Searching for available volunteers...
        </p>
      )}

      {status === 'unavailable' && (
        <p className="text-red-600 mt-4">
          ❌ No volunteers available right now. Please try again later.
        </p>
      )}

      {status === 'matched' && volunteer && (
        <MatchPopup
          volunteer={volunteer}
          onStartChat={() => { setChatOpen(true); setStatus('connected'); }}
          onStartCall={() => alert("Starting WebRTC call...")}
          onClose={() => setStatus('idle')}
        />
      )}

      {chatOpen && (
        <ChatBox
          sessionRoom={sessionRoom}
          onClose={() => { setChatOpen(false); setStatus('idle'); }}
        />
      )}
    </div>
  );
}
