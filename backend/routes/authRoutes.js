// ============================================
// AUTHENTICATION ROUTES - Google OAuth
// ============================================
// This file handles Google OAuth authentication flow
// Includes routes for initiating OAuth, handling callbacks, and managing sessions

const express = require('express'); // Express router for route handling
const passport = require('passport'); // Passport.js for OAuth authentication
const jwt = require('jsonwebtoken'); // JWT for creating authentication tokens
const crypto = require('crypto'); // For generating secure random session IDs
const dotenv = require('dotenv'); // Environment variables

dotenv.config(); // Load environment variables from .env
const router = express.Router(); // Create Express router instance
const JWT_SECRET = process.env.JWT_SECRET; // Secret key for signing JWTs

// ============================================
// IN-MEMORY SESSION STORE
// ============================================
// Temporary storage for OAuth session data during the redirect flow
// In production, use Redis or similar distributed cache for scalability
// This allows frontend to retrieve authentication data after OAuth redirect
global.authSessions = global.authSessions || {}; // Create global object if not exists

// ============================================
// ROUTE 1: Initiate Google OAuth Flow
// ============================================
// When user clicks "Login with Google", redirect to this endpoint
// Passport redirects user to Google's authentication page
// URL: GET /api/auth/google
router.get('/google',
  // Passport middleware handles redirect to Google OAuth page
  passport.authenticate('google', { 
    scope: ['profile', 'email'] // Request access to user's profile and email
  })
);

// ============================================
// ROUTE 2: Google OAuth Callback Handler
// ============================================
// Google redirects here after user authenticates
// This route processes the authentication result
// URL: GET /api/auth/google/callback
router.get('/google/callback',
  // Passport processes Google's authentication response
  // If authentication fails, redirect user to login page
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // ============================================
    // User authenticated successfully
    // ============================================
    // req.user is populated by Passport with user data from database
    
    // Create JWT token for user authentication
    // This token will be used for all subsequent API requests
    const token = jwt.sign(
      { id: req.user._id }, // Payload: user ID
      JWT_SECRET, // Secret key for signing
      { expiresIn: '7d' } // Token expires in 7 days
    );

    // Generate unique session ID for temporary storage
    // This is used to pass authentication data to frontend
    const sessionId = crypto.randomBytes(16).toString('hex'); // 32-character hex string
    const expiryTime = Date.now() + 5 * 60 * 1000; // Session expires in 5 minutes

    // Store authentication data in in-memory session store
    // Frontend will fetch this data using the session ID
    global.authSessions[sessionId] = {
      token, // JWT for API authentication
      userId: req.user._id, // User's database ID
      fullName: req.user.fullName, // User's full name
      email: req.user.email, // User's email address
      // Profile picture URL - prefer Google image, fallback to uploaded image
      profilePic: req.user.googleProfileImage ||
        (req.user.profileImage ? `${process.env.BACKEND_URL}/${req.user.profileImage}` : null),
      expires: expiryTime, // When this session data expires
    };

    // 🛡️ Set secure HTTP-only cookie with session ID
    // This cookie cannot be accessed by JavaScript (prevents XSS attacks)
    res.cookie('auth_session', sessionId, {
      httpOnly: true, // Cookie not accessible via JavaScript
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'lax', // CSRF protection
      maxAge: 5 * 60 * 1000, // Cookie expires in 5 minutes
    });

    // Construct redirect URL to frontend with session ID as query parameter
    // Frontend will use this session ID to fetch authentication data
    const redirectUrl = `${process.env.FRONTEND_URL}/home?session=${sessionId}`;

    console.log('➡️ Redirecting to frontend:', redirectUrl);
    res.redirect(redirectUrl); // Redirect user to frontend home page
  }
);

// ============================================
// ROUTE 3: Retrieve Authentication Session Data
// ============================================
// Frontend calls this endpoint with session ID to get authentication data
// This is a one-time use endpoint - session is deleted after retrieval
// URL: GET /api/auth/session/:sessionId
router.get('/session/:sessionId', (req, res) => {
  const { sessionId } = req.params; // Extract session ID from URL
  const session = global.authSessions[sessionId]; // Retrieve session data

  // Check if session exists and hasn't expired
  if (!session || session.expires < Date.now()) {
    return res.status(404).json({ message: 'Session not found or expired' });
  }

  // Session is valid - delete it after use (one-time use for security)
  delete global.authSessions[sessionId];
  
  // Return authentication data to frontend
  // Frontend stores this data in localStorage
  res.json(session);
});

module.exports = router; // Export router for use in server.js
