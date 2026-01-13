import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../utils/socket";

const AuthChecker = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    // 🔥 REGISTER SOCKET ONCE (GLOBAL)
    if (token && userId) {
      socket.emit("register-user", userId);
      console.log("✅ Socket registered from AuthChecker:", userId);
      navigate("/dashboard");     // logged in
    } else {
      navigate("/landing");       // not logged in
    }
  }, [navigate]);

  return null;
};

export default AuthChecker;