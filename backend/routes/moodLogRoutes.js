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

router.post('/', async (req, res) => {
    const { userId, mood, note, date } = req.body;
  
    if (!userId || !mood || !date) {
      return res.status(400).json({ message: 'userId, mood, and date are required' });
    }
  
    try {
      const newMoodLog = new MoodLog({ userId, mood, note, date });
      await newMoodLog.save();
      res.status(201).json({ message: 'Mood log saved', newMoodLog });
    } catch (err) {
      res.status(500).json({ message: 'Error saving mood log' });
    }
  });


module.exports = router;
