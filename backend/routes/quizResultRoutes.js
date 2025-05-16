const express = require('express');
const router = express.Router();
const QuizResult = require('../models/QuizResult');
const { verifyToken } = require('../middleware/auth');
const User         = require('../models/User');

// GET all quiz results (Protected - only for admins in a real app)
router.get('/', verifyToken, async (req, res) => {
  try {
    const results = await QuizResult.find().populate('userId', 'fullName email');
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching quiz results' });
  }
});

// GET quiz results for the current user (Protected)
router.get('/user', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const results = await QuizResult.find({ userId }).sort({ createdAt: -1 });
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching quiz results', error: err.message });
  }
});

// POST a new quiz result (Protected)
router.post('/', verifyToken, async (req, res) => {
  const { score, level, date } = req.body;
  const userId = req.user.id;

  if (score === undefined || !level) {
    return res.status(400).json({ message: 'Score and level are required' });
  }

  try {
    const newResult = await QuizResult.create({
      userId,
      score,
      level,
      date: date ? new Date(date) : Date.now()
    });

    // ← Now this will work, because User is defined!
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $push: { quizResults: newResult._id } },
      { new: true, runValidators: true }
    );

    return res.status(201).json({ 
      message: 'Quiz result saved', 
      quizResult: newResult, 
      user: updatedUser 
    });
  } catch (err) {
    console.error('Error saving quiz result:', err);
    return res.status(500).json({ 
      message: 'Server error saving quiz', 
      error: err.message 
    });
  }
});
// PUT - Update a quiz result by ID (Protected)
router.put('/:id', verifyToken, async (req, res) => {
  const { score, level, date } = req.body;
  const userId = req.user.id; // Get userId from authenticated user

  // Basic validation
  if (score === undefined || !level) {
    return res.status(400).json({ message: 'Score and level are required' });
  }

  try {
    // First check if the quiz result belongs to the current user
    const quizResult = await QuizResult.findById(req.params.id);
    
    if (!quizResult) {
      return res.status(404).json({ message: 'Quiz result not found' });
    }
    
    // Ensure users can only update their own quiz results
    if (String(quizResult.userId) !== String(userId)) {
      return res.status(403).json({ message: 'Not authorized to update this quiz result' });
    }

    const updatedResult = await QuizResult.findByIdAndUpdate(
      req.params.id,
      { score, level, date: date || quizResult.date },
      { new: true }
    );

    res.json({ message: 'Quiz result updated', updatedResult });
  } catch (err) {
    res.status(500).json({ message: 'Error updating quiz result', error: err.message });
  }
});

// DELETE - Remove a quiz result by ID (Protected)
router.delete('/:id', verifyToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const quizResult = await QuizResult.findById(req.params.id);

    if (!quizResult) {
      return res.status(404).json({ message: 'Quiz result not found' });
    }

    // Ensure only the owner can delete their result
    if (String(quizResult.userId) !== String(userId)) {
      return res.status(403).json({ message: 'Not authorized to delete this quiz result' });
    }

    await QuizResult.findByIdAndDelete(req.params.id);

    res.json({ message: 'Quiz result deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting quiz result', error: err.message });
  }
});



module.exports = router;
