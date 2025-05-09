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

// Callback route
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Generate JWT token
    const token = jwt.sign({ id: req.user._id }, JWT_SECRET, { expiresIn: '1h' });
    
    // Build the redirect URL with token and user info
    let redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173/home'}?token=${token}&userId=${req.user._id}&fullName=${encodeURIComponent(req.user.fullName)}&email=${encodeURIComponent(req.user.email)}`;
    
    // Add profile image if it exists (prioritize Google profile image)
    if (req.user.googleProfileImage) {
      redirectUrl += `&profilePic=${encodeURIComponent(req.user.googleProfileImage)}`;
    } else if (req.user.profileImage) {
      redirectUrl += `&profilePic=${encodeURIComponent(`http://localhost:8000/${req.user.profileImage}`)}`;
    }
    
    console.log('Redirecting to:', redirectUrl);
    res.redirect(redirectUrl);
  }
);

module.exports = router;
