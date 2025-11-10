import React from 'react';
import { motion } from 'framer-motion';
import { FaUserCircle, FaComments, FaPhoneAlt, FaTimes } from 'react-icons/fa';

export default function MatchPopup({ volunteer, onStartChat, onStartCall, onClose }) {
  return (
    <motion.div 
      className="fixed top-0 left-0 w-full h-full bg-black/50 flex justify-center items-center z-50"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
    >
      <motion.div 
        className="bg-white rounded-2xl shadow-2xl w-[400px] p-6 text-center"
        initial={{ scale: 0.8 }} animate={{ scale: 1 }}
      >
        <FaUserCircle className="text-5xl text-purple-700 mx-auto mb-3" />
        <h2 className="text-xl font-semibold text-gray-800 mb-1">
          {volunteer.name}
        </h2>
        <p className="text-gray-600 mb-4">
          {volunteer.role} • {volunteer.skills.join(", ")}
        </p>

        <div className="flex justify-center gap-3">
          <button onClick={onStartChat} className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700">
            <FaComments /> Chat
          </button>
          <button onClick={onStartCall} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
            <FaPhoneAlt /> Call
          </button>
        </div>

        <button onClick={onClose} className="text-gray-500 mt-5 flex items-center mx-auto hover:text-gray-700">
          <FaTimes className="mr-2" /> Close
        </button>
      </motion.div>
    </motion.div>
  );
}
