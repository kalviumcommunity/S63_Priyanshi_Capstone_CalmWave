const express = require('express');
const router = express.Router();
const QuizResult = require('../models/QuizResult');

// GET all quiz results (Public - for demo purposes)
router.get('/', async (req, res) => {
  try {
    const results = await QuizResult.find().sort({ createdAt: -1 });
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching quiz results' });
  }
});

// GET quiz results for anonymous user (Public)
router.get('/anonymous', async (req, res) => {
  try {
    // Get quiz results without userId (anonymous users)
    const results = await QuizResult.find({ userId: { $exists: false } }).sort({ createdAt: -1 });
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching quiz results', error: err.message });
  }
});

// POST a new quiz result (Public - no authentication required)
router.post('/', async (req, res) => {
  const { score, level, date } = req.body;

  if (score === undefined || !level) {
    return res.status(400).json({ message: 'Score and level are required' });
  }

  try {
    const newResult = await QuizResult.create({
      score,
      level,
      date: date ? new Date(date) : Date.now()
      // No userId - anonymous user
    });

    return res.status(201).json({ 
      message: 'Quiz result saved', 
      quizResult: newResult
    });
  } catch (err) {
    console.error('Error saving quiz result:', err);
    return res.status(500).json({ 
      message: 'Server error saving quiz', 
      error: err.message 
    });
  }
});

// PUT - Update a quiz result by ID (Public)
router.put('/:id', async (req, res) => {
  const { score, level, date } = req.body;

  // Basic validation
  if (score === undefined || !level) {
    return res.status(400).json({ message: 'Score and level are required' });
  }

  try {
    const updatedResult = await QuizResult.findByIdAndUpdate(
      req.params.id,
      { score, level, date: date || Date.now() },
      { new: true }
    );

    if (!updatedResult) {
      return res.status(404).json({ message: 'Quiz result not found' });
    }

    res.json({ message: 'Quiz result updated', updatedResult });
  } catch (err) {
    res.status(500).json({ message: 'Error updating quiz result', error: err.message });
  }
});

// DELETE - Remove a quiz result by ID (Public)
router.delete('/:id', async (req, res) => {
  try {
    const deletedResult = await QuizResult.findByIdAndDelete(req.params.id);

    if (!deletedResult) {
      return res.status(404).json({ message: 'Quiz result not found' });
    }

    res.json({ message: 'Quiz result deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting quiz result', error: err.message });
  }
});

module.exports = router;
