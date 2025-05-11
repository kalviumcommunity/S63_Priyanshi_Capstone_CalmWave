const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth');
const dotenv = require('dotenv');

dotenv.config();

const router = express.Router();

// Ensure 'uploads/' folder exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Allowed file types (images only)
const FILE_TYPES = /jpeg|jpg|png|gif/;

const fileFilter = (req, file, cb) => {
  const extname = FILE_TYPES.test(path.extname(file.originalname).toLowerCase());
  const mimetype = FILE_TYPES.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (.jpg, .jpeg, .png, .gif)'));
  }
};

// Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

// Configure multer with file filter and size limit (2MB)
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

// POST /api/upload-profile
router.post('/upload-profile', verifyToken, (req, res) => {
  upload.single('profile')(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: err.message });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }
    console.log('File received:', req.file);

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const userId = req.body.userId;
    
    // Ensure the user can only update their own profile
    if (String(req.user.id) !== String(userId)) {
      return res.status(403).json({ message: 'Not authorized to update this user profile' });
    }
    
    const imagePath = req.file.path;

    try {
      await User.findByIdAndUpdate(userId, { profileImage: imagePath });
      res.json({ filePath: imagePath });
    } catch (updateErr) {
      console.error('Error saving to DB:', updateErr);
      res.status(500).json({ message: 'Error saving image path to user profile' });
    }
  });
});

module.exports = router;
