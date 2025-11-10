// client/src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // <-- CRITICAL: Must import App
import './index.css'; // <-- CRITICAL: Must import global CSS

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <App /> {/* <-- CRITICAL: Must render App */}
  </React.StrictMode>
);