import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// ✅ AuthChecker redirects instead of rendering pages directly.
// This keeps routing stable and prevents breaking other routes.

const AuthChecker = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const isAuthenticated = localStorage.getItem("token");

        if (isAuthenticated) {
            navigate("/dashboard");   // ✅ If logged in → go to dashboard
        } else {
            navigate("/landing");     // ✅ If NOT logged in → go to landing page
        }
    }, [navigate]);

    return null; // ✅ Nothing renders, just redirects.
};

export default AuthChecker;
