const express = require('express');
const router = express.Router();
const SoundSession = require('../models/SoundSession');

// GET all sound sessions
router.get('/', async (req, res) => {
  try {
    const sessions = await SoundSession.find();
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching sound sessions' });
  }
});

module.exports = router;
