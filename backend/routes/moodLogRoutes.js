const express = require('express');
const router = express.Router();
const MoodLog = require('../models/moodLog');
const User = require('../models/User');
const { verifyToken, isResourceOwner } = require('../middleware/auth');

// GET all mood logs (Protected - only for admins in a real app)
router.get('/', verifyToken, async (req, res) => {
  try {
    const moods = await MoodLog.find().populate('userId', 'fullName email'); // 👈 show only specific fields
    res.json(moods);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching mood logs' });
  }
});

// GET mood logs for the current user (Protected)
router.get('/user/:userId', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Ensure users can only access their own mood logs
    if (String(req.user.id) !== String(userId)) {
      return res.status(403).json({ message: 'Not authorized to access these mood logs' });
    }
    
    const moods = await MoodLog.find({ userId });
    res.json(moods);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching mood logs' });
  }
});




// Create a new mood log (Protected)
router.post('/', verifyToken, async (req, res) => {
  const { mood, note, date } = req.body;
  const userId = req.user.id;

  if (!mood || !date) {
    return res.status(400).json({ message: 'Mood and date are required' });
  }

  try {
    const newMoodLog = new MoodLog({ 
      userId, 
      mood, 
      note, 
      date: new Date(date) 
    });
    await newMoodLog.save();

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $push: { moodLogs: newMoodLog._id } },
      { new: true, runValidators: true }
    );

    console.log('Mood log saved:', newMoodLog);
    res.status(201).json({
      message: 'Mood log saved',
      moodLog: newMoodLog,
      user: updatedUser
    });
  } catch (err) {
    console.error('Error saving mood log:', err.message); // ✅ Cleaner log
    res.status(500).json({ message: 'Error saving mood log', error: err.message });
  }
});



  // PUT - Update a mood log by ID (Protected)
router.put('/:id', verifyToken, async (req, res) => {
  const { mood, note, date } = req.body;
  const userId = req.user.id; // Get userId from the authenticated user

  // Validate required fields
  if (!mood || !date) {
    return res.status(400).json({ message: 'Mood and date are required' });
  }

  try {
    // First check if the mood log exists and belongs to the user
    const moodLog = await MoodLog.findById(req.params.id);
    
    if (!moodLog) {
      return res.status(404).json({ message: 'Mood log not found' });
    }
    
    // Ensure the user can only update their own mood logs
    if (String(moodLog.userId) !== String(userId)) {
      return res.status(403).json({ message: 'Not authorized to update this mood log' });
    }

    const updatedMoodLog = await MoodLog.findByIdAndUpdate(
      req.params.id,
      { mood, note, date: new Date(date) },
      { new: true }
    );

    res.json({ message: 'Mood log updated', updatedMoodLog });
  } catch (err) {
    console.error('Error updating mood log:', err);
    res.status(500).json({ message: 'Error updating mood log', error: err.message });
  }
});

// DELETE - Delete a mood log by ID (Protected)
router.delete('/:id', verifyToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const moodLog = await MoodLog.findById(req.params.id);
    if (!moodLog) {
      return res.status(404).json({ message: 'Mood log not found' });
    }

    // Only allow deletion if the mood log belongs to the current user
    if (String(moodLog.userId) !== String(userId)) {
      return res.status(403).json({ message: 'Not authorized to delete this mood log' });
    }

    await MoodLog.findByIdAndDelete(req.params.id);

    // Optionally: Remove reference from User's moodLogs array
    await User.findByIdAndUpdate(userId, {
      $pull: { moodLogs: req.params.id }
    });

    res.json({ message: 'Mood log deleted successfully' });
  } catch (err) {
    console.error('Error deleting mood log:', err);
    res.status(500).json({ message: 'Error deleting mood log', error: err.message });
  }
});




module.exports = router;
