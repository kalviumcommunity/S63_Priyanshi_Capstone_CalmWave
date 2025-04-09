const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error("Error fetching data:", error.message);
    res.status(500).json({ error: "Something went wrong while fetching data." });
  }
});

module.exports = router;
