const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

const fs = require('fs');

// Ensure 'uploads/' folder exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}


// Set up Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Make sure 'uploads' folder exists
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// POST /api/upload-profile
router.post('/upload-profile', upload.single('profile'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  res.json({ filePath: req.file.path });
});

module.exports = router;
