const express = require('express');
const router = express.Router();
const MoodLog = require('../models/MoodLog');

// GET all mood logs
router.get('/', async (req, res) => {
  try {
    const moods = await MoodLog.find();
    res.json(moods);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching mood logs' });
  }
});

module.exports = router;
