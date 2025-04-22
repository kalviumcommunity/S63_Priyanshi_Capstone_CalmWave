const express = require('express');
const passport = require('passport');
const router = express.Router();

// Trigger Google OAuth
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));

// Callback route
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/dashboard' }),
  (req, res) => {
    res.redirect(process.env.FRONTEND_URL || 'http://localhost:5173/Home');
 // frontend route after success
  }
);

module.exports = router;
