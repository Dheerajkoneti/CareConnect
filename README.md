🫂 CareConnect

CareConnect is a full-stack MERN application designed to foster community engagement, mental well-being, and real-time communication.
It enables users to connect through community feeds, real-time chat, voice/video calls, AI-powered support, and notifications, with a special focus on elderly users, students, and underserved communities.

🌟 Key Features
👥 Community & Social

Community Feed (posts, updates, engagement)

Community Chat & Active Chats

Volunteer Support System

Role-based user experience

💬 Real-Time Communication

Real-time Chat using Socket.io

Voice Calls using Twilio

Video Call (testing module)

Missed Call Notifications

🔔 Notifications

Real-time notifications (Socket.io)

Notification Bell with unread count

Notification history page

Persistent notifications stored in MongoDB

🤖 AI & Wellness

AI Companion Chat

Wellness Tips

Mood Tracking & Insights

Progress & Analytics Dashboard

🔐 Authentication & Security

JWT-based Authentication

Secure Login & Registration

Protected Routes

Passport.js integrations (Google strategy ready)

🛠 Tech Stack
Frontend

React

React Router

Socket.io Client

Axios

Tailwind / Custom CSS

Backend

Node.js

Express.js

Socket.io

JWT Authentication

Passport.js

Database

MongoDB (Mongoose)

External Services

Twilio (Voice Calls)

AI APIs (for Companion Chat)

DevOps & Tools

Git & GitHub

MongoDB Atlas

Render (Backend Deployment)

Vercel (Frontend Deployment)

📂 Project Structure
CareConnect/
│
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── utils/
│   │   └── socket.js
│
├── server/                 # Node.js backend
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── socket/
│   ├── config/
│   └── server.js
│
├── .gitignore
└── README.md
