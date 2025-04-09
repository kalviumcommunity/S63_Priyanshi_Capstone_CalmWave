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


module.exports = router;
