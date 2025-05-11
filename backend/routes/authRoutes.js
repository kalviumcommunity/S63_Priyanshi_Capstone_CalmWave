const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = express.Router();
const dotenv = require('dotenv');

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

// Trigger Google OAuth
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));

// Endpoint to securely retrieve auth data
router.get('/session/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  
  // Check if session exists and is not expired
  if (!global.authSessions || 
      !global.authSessions[sessionId] || 
      global.authSessions[sessionId].expires < Date.now()) {
    return res.status(404).json({ message: 'Session not found or expired' });
  }
  
  // Get auth data
  const authData = global.authSessions[sessionId];
  
  // Delete the session to prevent reuse (one-time use)
  delete global.authSessions[sessionId];
  
  // Return the auth data
  res.json(authData);
});

// Callback route
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Generate JWT token
    const token = jwt.sign({ id: req.user._id }, JWT_SECRET, { expiresIn: '7d' });
    
    // Create a temporary auth session with a random ID
    const sessionId = require('crypto').randomBytes(16).toString('hex');
    
    // Store auth data in server-side session (would use Redis in production)
    // For this demo, we'll use a simple in-memory store
    if (!global.authSessions) {
      global.authSessions = {};
    }
    
    // Store the auth data with 5-minute expiry
    global.authSessions[sessionId] = {
      token,
      userId: req.user._id,
      fullName: req.user.fullName,
      email: req.user.email,
      profilePic: req.user.googleProfileImage || 
                 (req.user.profileImage ? `http://localhost:8000/${req.user.profileImage}` : null),
      expires: Date.now() + (5 * 60 * 1000) // 5 minutes
    };
    
    // Set a secure, HTTP-only cookie with the session ID
    res.cookie('auth_session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 5 * 60 * 1000 // 5 minutes
    });
    
    // Redirect to frontend with just the session ID (not sensitive data)
    const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173/home'}?session=${sessionId}`;
    console.log('Redirecting to:', redirectUrl);
    res.redirect(redirectUrl);
  }
);

module.exports = router;
