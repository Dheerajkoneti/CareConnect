// client/src/pages/AuthPage.js (or wherever GoogleSignInButton is defined)
import React from 'react';
import { GoogleLogin } from '@react-google-login'; // Assuming you are using this library

// ------------------------------------------------------------------
// FIX: Access the Client ID from the environment variable (via process.env)
// This requires the name to be REACT_APP_GOOGLE_CLIENT_ID in your .env file.
const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
// ------------------------------------------------------------------

function GoogleSignInButton() {
    
    // Safety check: Ensure the Client ID is loaded
    if (!CLIENT_ID) {
        console.error("Google Client ID is missing! Check your .env file.");
        return <button disabled>Google Sign In (Config Error)</button>;
    }

    const handleSuccessfulLogin = (response) => {
        console.log("Login Success:", response);
        // Implement your logic to send the token/response to your backend server
    };

    const handleFailedLogin = (error) => {
        console.error("Login Failed:", error);
        // Display user-friendly error
    };

    return (
        <GoogleLogin
            // Use the loaded environment variable
            clientId={CLIENT_ID} 
            buttonText="Sign in with Google"
            onSuccess={handleSuccessfulLogin}
            onFailure={handleFailedLogin}
            cookiePolicy={'single_host_origin'}
            // Optional: Include a redirect_uri here if needed by your backend flow
            // redirectUri="http://localhost:3000/auth/google/callback" 
        />
    );
}

// export default GoogleSignInButton; // or whatever your main component export is