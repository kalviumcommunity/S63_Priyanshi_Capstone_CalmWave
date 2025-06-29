const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const dotenv = require('dotenv');

dotenv.config();
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// In-memory session store (for demo; use Redis in production)
global.authSessions = global.authSessions || {};

// 🔁 Trigger Google OAuth
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// ✅ Google OAuth Callback
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id }, JWT_SECRET, { expiresIn: '7d' });

    const sessionId = crypto.randomBytes(16).toString('hex');
    const expiryTime = Date.now() + 5 * 60 * 1000; // 5 min

    global.authSessions[sessionId] = {
      token,
      userId: req.user._id,
      fullName: req.user.fullName,
      email: req.user.email,
      profilePic: req.user.googleProfileImage ||
        (req.user.profileImage ? `${process.env.BACKEND_URL}/${req.user.profileImage}` : null),
      expires: expiryTime,
    };

    // 🛡️ Set secure cookie with session ID
    res.cookie('auth_session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 5 * 60 * 1000,
    });

    const redirectUrl = `${process.env.FRONTEND_URL}/home?session=${sessionId}`;

    console.log('➡️ Redirecting to frontend:', redirectUrl);
    res.redirect(redirectUrl);
  }
);

// 🔐 Get Auth Session Data (one-time use)
router.get('/session/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const session = global.authSessions[sessionId];

  if (!session || session.expires < Date.now()) {
    return res.status(404).json({ message: 'Session not found or expired' });
  }

  // One-time use: delete after fetching
  delete global.authSessions[sessionId];
  res.json(session);
});

module.exports = router;
