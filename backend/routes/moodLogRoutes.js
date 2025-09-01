const express = require('express');
const router = express.Router();
const MoodLog = require('../models/moodLog');

// GET all mood logs (Public - for demo purposes)
router.get('/', async (req, res) => {
  try {
    const moods = await MoodLog.find().sort({ date: -1 });
    res.json(moods);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching mood logs' });
  }
});

// GET mood logs for anonymous user (Public)
router.get('/anonymous', async (req, res) => {
  try {
    // Get mood logs without userId (anonymous users)
    const moods = await MoodLog.find({ userId: { $exists: false } }).sort({ date: -1 });
    res.json(moods);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching mood logs' });
  }
});

// Create a new mood log (Public - no authentication required)
router.post('/', async (req, res) => {
  const { mood, note, date } = req.body;

  if (!mood || !date) {
    return res.status(400).json({ message: 'Mood and date are required' });
  }

  try {
    const newMoodLog = new MoodLog({ 
      mood, 
      note, 
      date: new Date(date) 
      // No userId - anonymous user
    });
    await newMoodLog.save();

    console.log('Mood log saved:', newMoodLog);
    res.status(201).json({
      message: 'Mood log saved',
      moodLog: newMoodLog
    });
  } catch (err) {
    console.error('Error saving mood log:', err.message);
    res.status(500).json({ message: 'Error saving mood log', error: err.message });
  }
});

// PUT - Update a mood log by ID (Public)
router.put('/:id', async (req, res) => {
  const { mood, note, date } = req.body;

  // Validate required fields
  if (!mood || !date) {
    return res.status(400).json({ message: 'Mood and date are required' });
  }

  try {
    const updatedMoodLog = await MoodLog.findByIdAndUpdate(
      req.params.id,
      { mood, note, date: new Date(date) },
      { new: true }
    );

    if (!updatedMoodLog) {
      return res.status(404).json({ message: 'Mood log not found' });
    }

    res.json({ message: 'Mood log updated', updatedMoodLog });
  } catch (err) {
    console.error('Error updating mood log:', err);
    res.status(500).json({ message: 'Error updating mood log', error: err.message });
  }
});

// DELETE - Delete a mood log by ID (Public)
router.delete('/:id', async (req, res) => {
  try {
    const deletedMoodLog = await MoodLog.findByIdAndDelete(req.params.id);
    
    if (!deletedMoodLog) {
      return res.status(404).json({ message: 'Mood log not found' });
    }

    res.json({ message: 'Mood log deleted successfully' });
  } catch (err) {
    console.error('Error deleting mood log:', err);
    res.status(500).json({ message: 'Error deleting mood log', error: err.message });
  }
});

module.exports = router;
