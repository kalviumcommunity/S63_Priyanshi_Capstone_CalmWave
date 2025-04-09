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

// POST a new sound session
router.post('/', async (req, res) => {
  const { userId, frequency, duration, date } = req.body;

  if (!userId || !frequency || !duration || !date) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const newSession = new SoundSession({ userId, frequency, duration, date });
    await newSession.save();
    res.status(201).json({ message: 'Sound session created', newSession });
  } catch (err) {
    res.status(500).json({ message: 'Error creating sound session' });
  }
});

// PUT - Update a sound session by ID
router.put('/:id', async (req, res) => {
  const { userId, frequency, duration, date } = req.body;

  // Basic validation
  if (!userId || !frequency || !duration || !date) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const updatedSession = await SoundSession.findByIdAndUpdate(
      req.params.id,
      { userId, frequency, duration, date },
      { new: true }
    );

    if (!updatedSession) {
      return res.status(404).json({ message: 'Sound session not found' });
    }

    res.json({ message: 'Sound session updated', updatedSession });
  } catch (err) {
    res.status(500).json({ message: 'Error updating sound session', error: err.message });
  }
});




module.exports = router;
