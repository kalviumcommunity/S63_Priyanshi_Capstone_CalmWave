const express = require('express');
const router = express.Router();
const MoodLog = require('../models/moodLog');

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


  

  // PUT - Update a mood log by ID
router.put('/:id', async (req, res) => {
  const { userId, mood, note, date } = req.body;

  // Validate required fields
  if (!userId || !mood || !date) {
    return res.status(400).json({ message: 'userId, mood, and date are required' });
  }

  try {
    const updatedMoodLog = await MoodLog.findByIdAndUpdate(
      req.params.id,
      { userId, mood, note, date },
      { new: true }
    );

    if (!updatedMoodLog) {
      return res.status(404).json({ message: 'Mood log not found' });
    }

    res.json({ message: 'Mood log updated', updatedMoodLog });
  } catch (err) {
    res.status(500).json({ message: 'Error updating mood log', error: err.message });
  }
});



module.exports = router;
