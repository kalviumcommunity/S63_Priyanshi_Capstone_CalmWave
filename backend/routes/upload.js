const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

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
router.post('/upload-profile', (req, res) => {
  upload.single('profile')(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: err.message });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    res.json({ filePath: req.file.path });
  });
});

module.exports = router;
