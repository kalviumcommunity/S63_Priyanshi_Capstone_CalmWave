const express = require('express');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { verifyToken, isResourceOwner } = require('../middleware/auth');
const router = express.Router();

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

// =====================
// 🔐 Register Route
// =====================
router.post('/register', async (req, res) => {
  console.log('📝 Registration request received');
  console.log('Origin:', req.headers.origin);
  console.log('Request body:', req.body);

  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email: email.trim().toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const newUser = new User({
      fullName,
      email: email.trim().toLowerCase(),
      password: password.trim()
    });

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
    console.error('❌ Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// =====================
// 🔑 Login Route
// =====================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('📥 Login attempt:', req.body);

    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      console.log('❌ User not found for:', cleanEmail);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password.trim());

    if (!isMatch) {
      console.log('❌ Password mismatch for user:', cleanEmail);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });

    console.log('✅ Login successful for:', cleanEmail);

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
    console.error('🔥 Server error during login:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// =====================
// 👤 Get All Users (Protected)
// =====================
router.get('/', verifyToken, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// =====================
// 👤 Get Current User Profile
// =====================
router.get('/profile/me', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId)
      .select('-password')
      .populate({ path: 'quizResultsData', options: { sort: { createdAt: -1 }, limit: 10 } })
      .populate({ path: 'moodLogsData', options: { sort: { date: -1 }, limit: 10 } })
      .populate({ path: 'soundSessionsData', options: { sort: { createdAt: -1 }, limit: 10 } });

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
    res.status(500).json({ message: 'Error fetching user profile' });
  }
});

// =====================
// 🧑‍💻 Get User By ID (Protected)
// =====================
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate({ path: 'quizResultsData', options: { sort: { createdAt: -1 }, limit: 10 } })
      .populate({ path: 'moodLogsData', options: { sort: { date: -1 }, limit: 10 } })
      .populate({ path: 'soundSessionsData', options: { sort: { createdAt: -1 }, limit: 10 } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userResponse = user.toObject();
    if (user.googleProfileImage) {
      userResponse.googleProfileImage = user.googleProfileImage;
    }

    res.json(userResponse);
  } catch (err) {
    console.error('Error fetching user by ID:', err);
    res.status(500).json({ message: 'Error fetching user' });
  }
});

// =====================
// ✏️ Update User (Protected)
// =====================
router.put('/:id', verifyToken, isResourceOwner, async (req, res) => {
  try {
    const { fullName, email, currentPassword, newPassword } = req.body;
    const updateData = {};

    if (fullName) updateData.fullName = fullName;
    if (email) updateData.email = email;

    if (newPassword) {
      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ message: 'User not found' });

      if (user.password) {
        if (!currentPassword) {
          return res.status(400).json({ message: 'Current password is required' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
          return res.status(400).json({ message: 'Current password is incorrect' });
        }
      }

      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(newPassword, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User updated successfully', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
});

// =====================
// 🗑️ Delete User (Protected)
// =====================
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
