const express = require('express');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { verifyToken, isResourceOwner } = require('../middleware/auth');
const router = express.Router();

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

// Register Route
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const newUser = new User({ fullName, email, password });
    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      user: {
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email
      },
      token
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password.trim(), user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        profileImage: user.profileImage
      },
      token
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get all users (Protected)
router.get('/', verifyToken, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Get current user profile with quiz results, mood logs, and sound sessions (Protected)
router.get('/profile/me', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId)
      .select('-password')
      .populate({
        path: 'quizResultsData',
        options: { sort: { createdAt: -1 }, limit: 10 } // Get the 10 most recent quiz results
      })
      .populate({
        path: 'moodLogsData',
        options: { sort: { date: -1 }, limit: 10 } // Get the 10 most recent mood logs
      })
      .populate({
        path: 'soundSessionsData',
        options: { sort: { createdAt: -1 }, limit: 10 } // Get the 10 most recent sound sessions
      });
      
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        profileImage: user.profileImage,
        googleProfileImage: user.googleProfileImage || null
      },
      quizResults: user.quizResultsData || [],
      moodLogs: user.moodLogsData || [],
      soundSessions: user.soundSessionsData || []
    });
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ message: 'Error fetching user profile', error: err.message });
  }
});

// Get user by ID (Protected)
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate({
        path: 'quizResultsData',
        options: { sort: { createdAt: -1 }, limit: 10 }
      })
      .populate({
        path: 'moodLogsData',
        options: { sort: { date: -1 }, limit: 10 }
      })
      .populate({
        path: 'soundSessionsData',
        options: { sort: { createdAt: -1 }, limit: 10 }
      });
      
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Create a response object with user data
    const userResponse = user.toObject();
    
    // If user has a Google profile image, include it in the response
    if (user.googleProfileImage) {
      userResponse.googleProfileImage = user.googleProfileImage;
    }
    
    res.json(userResponse);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ message: 'Error fetching user' });
  }
});

// Update user (Protected)
router.put('/:id', verifyToken, isResourceOwner, async (req, res) => {
  try {

    const { fullName, email, currentPassword, newPassword } = req.body;
    const updateData = {};

    // Only add fields that are provided
    if (fullName) updateData.fullName = fullName;
    if (email) updateData.email = email;

    // If user wants to change password
    if (newPassword) {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check if user has a password (Google OAuth users might not have one)
      if (user.password) {
        // If user has a password, require current password
        if (!currentPassword) {
          return res.status(400).json({ message: 'Current password is required' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
          return res.status(400).json({ message: 'Current password is incorrect' });
        }
      } else if (user.googleId && !currentPassword) {
        // Google OAuth user setting password for the first time - no current password needed
        console.log('Google user setting password for the first time');
      } else if (!user.googleId && !currentPassword) {
        // Non-Google user must provide current password
        return res.status(400).json({ message: 'Current password is required' });
      }

      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(newPassword, salt);
    }

    // Update the user
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
});

// Delete user (Protected)
router.delete('/:id', verifyToken, isResourceOwner, async (req, res) => {
  try {

    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
});

module.exports = router;
