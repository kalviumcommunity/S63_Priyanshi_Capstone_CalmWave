const express = require('express');
const router = express.Router();
const SoundSession = require('../models/SoundSession');

// GET all sound sessions (Public - for demo purposes)
router.get('/', async (req, res) => {
  try {
    const sessions = await SoundSession.find().sort({ date: -1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching sound sessions' });
  }
});

// POST a new sound session (Public - no authentication required)
router.post('/', async (req, res) => {
  console.log('Received sound session request:', req.body);
  
  const { sessionType, audioName, duration } = req.body;
  
  console.log('Creating anonymous sound session');

  if (!sessionType || !audioName || !duration) {
    console.log('Validation failed - missing required fields');
    return res.status(400).json({ message: 'Session type, audio name, and duration are required' });
  }

  try {
    console.log('Creating new sound session with data:', {
      sessionType,
      audioName,
      duration
    });
    
    const newSession = new SoundSession({
      sessionType,
      audioName,
      duration,
      date: new Date()
      // No userId - anonymous user
    });
    
    console.log('Saving sound session to database...');
    const savedSession = await newSession.save();
    console.log('Sound session saved successfully:', savedSession);

    res.status(201).json({ message: 'Sound session created', newSession: savedSession });
  } catch (err) {
    console.error('Error creating sound session:', err);
    res.status(500).json({ message: 'Error creating sound session', error: err.message });
  }
});

// PUT - Update a sound session by ID (Public)
router.put('/:id', async (req, res) => {
  const { sessionType, audioName, duration } = req.body;

  // Basic validation
  if (!sessionType || !audioName || !duration) {
    return res.status(400).json({ message: 'Session type, audio name, and duration are required' });
  }

  try {
    const updatedSession = await SoundSession.findByIdAndUpdate(
      req.params.id,
      { sessionType, audioName, duration },
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

// GET sound sessions for anonymous user (Public)
router.get('/anonymous', async (req, res) => {
  try {
    // Get sound sessions without userId (anonymous users)
    const sessions = await SoundSession.find({ userId: { $exists: false } }).sort({ date: -1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching sound sessions', error: err.message });
  }
});

// GET sound sessions for a specific user by ID (Public - for demo purposes)
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const sessions = await SoundSession.find({ userId })
      .sort({ date: -1 })
      .limit(20);
      
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching sound sessions' });
  }
});

// DELETE - Delete a sound session by ID (Public)
router.delete('/:id', async (req, res) => {
  try {
    const deletedSession = await SoundSession.findByIdAndDelete(req.params.id);

    if (!deletedSession) {
      return res.status(404).json({ message: 'Sound session not found' });
    }

    res.json({ message: 'Sound session deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting sound session', error: err.message });
  }
});

module.exports = router;
