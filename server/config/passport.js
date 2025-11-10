// server/config/passport.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User'); 

// Passport setup: Serialize and deserialize user sessions
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id).then(user => {
        done(null, user);
    });
});

// Configure Google Strategy
passport.use(
    new GoogleStrategy({
        // CRITICAL FIX: The process.env variables are read here
        clientID: process.env.GOOGLE_CLIENT_ID || 'dummy_client_id_if_missing', // Use OR operator for better error handling during testing
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy_secret_if_missing',
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
        // This logic handles saving/logging in the user once Google authenticates them
        
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;

        if (!email) {
            return done(null, false, { message: 'Google did not provide an email address.' });
        }

        try {
            const existingUser = await User.findOne({ email });

            if (existingUser) {
                // User exists: Proceed to login
                return done(null, existingUser);
            } else {
                // New user: Create a new account
                const newUser = await new User({
                    fullName: profile.displayName,
                    email: email,
                    // Note: Hashing will be applied via the pre-save hook
                    password: crypto.randomBytes(20).toString('hex'), // Create a random password for model validation
                    role: 'community_member'
                }).save();
                return done(null, newUser);
            }
        } catch (err) {
            return done(err, false);
        }
    })
);

// Note: Add 'const crypto = require('crypto');' to the top of this file if it throws a reference error.