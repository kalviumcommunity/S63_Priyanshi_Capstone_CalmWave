const express = require('express');
const router = express.Router();
const QuizResult = require('../models/QuizResult');

// GET all quiz results
router.get('/', async (req, res) => {
  try {
    const results = await QuizResult.find();
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching quiz results' });
  }
});

router.post('/', async (req, res) => {
    const { userId, score, level, date } = req.body;
  
    if (!userId || score === undefined || !level || !date) {
      return res.status(400).json({ message: 'All fields are required' });
    }
  
    try {
      const newResult = new QuizResult({ userId, score, level, date });
      await newResult.save();
      res.status(201).json({ message: 'Quiz result saved', newResult });
    } catch (err) {
      res.status(500).json({ message: 'Error saving quiz result' });
    }
  });


  // PUT - Update a quiz result by ID
router.put('/:id', async (req, res) => {
  const { userId, score, level, date } = req.body;

  // Basic validation
  if (!userId || score === undefined || !level || !date) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const updatedResult = await QuizResult.findByIdAndUpdate(
      req.params.id,
      { userId, score, level, date },
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



module.exports = router;
