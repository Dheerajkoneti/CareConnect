import React from "react";
import { FaPhone, FaPhoneSlash, FaVideo } from "react-icons/fa";
import "../styles/IncomingCall.css";

export default function IncomingCallPopup({ call, onAccept, onReject }) {
  if (!call) return null;

  return (
    <div className="incoming-overlay">
      <div className="incoming-box">

        <div className="title">Incoming Call</div>

        <div className="caller">{call.fromName}</div>

        <div className="actions">
          <button className="accept" onClick={onAccept}>
            <FaPhone /> Accept
          </button>

          <button className="reject" onClick={onReject}>
            <FaPhoneSlash /> Reject
          </button>
        </div>
      </div>
    </div>
  );
}
