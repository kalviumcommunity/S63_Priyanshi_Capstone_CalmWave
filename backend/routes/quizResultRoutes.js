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

module.exports = router;
