const express = require('express');
const router = express.Router();
const SoundSession = require('../models/SoundSession');
const { verifyToken } = require('../middleware/auth');

// GET all sound sessions (Protected - only for admins in a real app)
router.get('/', verifyToken, async (req, res) => {
  try {
    const sessions = await SoundSession.find().populate('userId', 'fullName email');
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching sound sessions' });
  }
});

// POST a new sound session (Protected)
// POST a new sound session (Protected)
router.post('/', verifyToken, async (req, res) => {
  console.log('Received sound session request:', req.body);
  
  const { sessionType, audioName, duration } = req.body;
  const userId = req.user.id; // Get userId from authenticated user
  
  console.log('User ID from token:', userId);

  if (!sessionType || !audioName || !duration) {
    console.log('Validation failed - missing required fields');
    return res.status(400).json({ message: 'Session type, audio name, and duration are required' });
  }

  try {
    console.log('Creating new sound session with data:', {
      userId,
      sessionType,
      audioName,
      duration
    });
    
    const newSession = new SoundSession({
      userId,
      sessionType,
      audioName,
      duration,
      date: new Date()
    });
    
    console.log('Saving sound session to database...');
    const savedSession = await newSession.save();
    console.log('Sound session saved successfully:', savedSession);

    // ✅ Update user's soundSessions array
    const User = require('../models/User');
    await User.findByIdAndUpdate(userId, {
      $push: { soundSessions: savedSession._id }
    });

    res.status(201).json({ message: 'Sound session created and linked to user', newSession: savedSession });
  } catch (err) {
    console.error('Error creating sound session:', err);
    res.status(500).json({ message: 'Error creating sound session', error: err.message });
  }
});


// PUT - Update a sound session by ID (Protected)
router.put('/:id', verifyToken, async (req, res) => {
  const { sessionType, audioName, duration } = req.body;
  const userId = req.user.id;

  // Basic validation
  if (!sessionType || !audioName || !duration) {
    return res.status(400).json({ message: 'Session type, audio name, and duration are required' });
  }

  try {
    // First check if the session belongs to the current user
    const session = await SoundSession.findById(req.params.id);
    
    if (!session) {
      return res.status(404).json({ message: 'Sound session not found' });
    }
    
    // Ensure users can only update their own sessions
    if (String(session.userId) !== String(userId)) {
      return res.status(403).json({ message: 'Not authorized to update this session' });
    }

    const updatedSession = await SoundSession.findByIdAndUpdate(
      req.params.id,
      { sessionType, audioName, duration },
      { new: true }
    );

    res.json({ message: 'Sound session updated', updatedSession });
  } catch (err) {
    res.status(500).json({ message: 'Error updating sound session', error: err.message });
  }
});

// GET sound sessions for the current user (Protected)
router.get('/user', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const sessions = await SoundSession.find({ userId })
      .sort({ createdAt: -1 }) // Get most recent sessions first
      .limit(20); // Limit to 20 most recent sessions
      
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching sound sessions', error: err.message });
  }
});

// GET sound sessions for a specific user by ID (Protected - Admin only in real app)
router.get('/user/:userId', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Ensure users can only access their own sound sessions
    if (String(req.user.id) !== String(userId)) {
      return res.status(403).json({ message: 'Not authorized to access these sound sessions' });
    }
    
    const sessions = await SoundSession.find({ userId })
      .sort({ createdAt: -1 })
      .limit(20);
      
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching sound sessions' });
  }
});

// DELETE - Delete a sound session by ID (Protected)
router.delete('/:id', verifyToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const session = await SoundSession.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ message: 'Sound session not found' });
    }

    // Check if the session belongs to the current user
    if (String(session.userId) !== String(userId)) {
      return res.status(403).json({ message: 'Not authorized to delete this session' });
    }

    await SoundSession.findByIdAndDelete(req.params.id);

    // Also remove it from the user's `soundSessions` array (optional)
    const User = require('../models/User');
    await User.findByIdAndUpdate(userId, {
      $pull: { soundSessions: session._id }
    });

    res.json({ message: 'Sound session deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting sound session', error: err.message });
  }
});

module.exports = router;
