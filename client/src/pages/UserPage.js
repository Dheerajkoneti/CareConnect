import io from 'socket.io-client';
import { useState, useEffect } from 'react';

const socket = io('http://localhost:5000');

export default function UserSupportPage() {
  const [status, setStatus] = useState('idle');
  const [volunteer, setVolunteer] = useState(null);

  const handleRequestHelp = () => {
    socket.emit('user_request_support', { id: 'u_001', name: 'Elderly User' });
    setStatus('searching');
  };

  useEffect(() => {
    socket.on('match_found', ({ room, volunteer }) => {
      setVolunteer(volunteer);
      setStatus('connected');
    });

    socket.on('no_volunteer_available', () => setStatus('no_volunteer'));
  }, []);

  return (
    <div>
      {status === 'idle' && <button onClick={handleRequestHelp}>Need Support</button>}
      {status === 'searching' && <p>🔍 Searching for an available volunteer...</p>}
      {status === 'connected' && <p>✅ Connected with {volunteer.name}</p>}
      {status === 'no_volunteer' && <p>❌ No volunteers available. Please try again later.</p>}
    </div>
  );
}
