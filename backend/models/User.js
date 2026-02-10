// ============================================
// USER MODEL - MongoDB Schema Definition
// ============================================
// This file defines the User schema for MongoDB
// Handles user data, password hashing, and relationships with other collections

const mongoose = require('mongoose'); // MongoDB ODM (Object Data Modeling)
const bcrypt = require('bcryptjs'); // Library for hashing passwords securely

// ============================================
// USER SCHEMA DEFINITION
// ============================================
// Define the structure of user documents in MongoDB
const userSchema = new mongoose.Schema({
  // User's full name (required field)
  fullName: { 
    type: String, 
    required: true // This field must be provided when creating a user
  },
  
  // User's email address (required and must be unique)
  email: { 
    type: String, 
    required: true, // Email is required for all users
    unique: true // Prevents duplicate email addresses in database
  },
  
  // User's password (optional - not required for Google OAuth users)
  password: { 
    type: String // Optional field - Google OAuth users won't have password
  },
  
  // Google account ID (for OAuth users)
  googleId: { 
    type: String, 
    unique: true, // Each Google ID can only be linked to one account
    sparse: true // Allows multiple null values (for non-Google users)
  },
  
  // Google profile image URL (from Google account)
  googleProfileImage: { 
    type: String, 
    default: '' // Empty string if no Google image
  },
  
  // User-uploaded profile image (relative path to image file)
  profileImage: {
    type: String,
    default: '' // Empty string if user hasn't uploaded image
  },
  
  // ============================================
  // RELATIONSHIPS - References to other collections
  // ============================================
  // These arrays store ObjectId references to related documents
  // This creates a one-to-many relationship (one user, many quiz results/mood logs/sessions)
  
  // Array of quiz result IDs associated with this user
  quizResults: [{
    type: mongoose.Schema.Types.ObjectId, // Reference to QuizResult document
    ref: 'QuizResult' // Name of the referenced model
  }],
  
  // Array of mood log IDs associated with this user
  moodLogs: [{
    type: mongoose.Schema.Types.ObjectId, // Reference to MoodLog document
    ref: 'MoodLog' // Name of the referenced model
  }],
  
  // Array of sound session IDs associated with this user
  soundSessions: [{
    type: mongoose.Schema.Types.ObjectId, // Reference to SoundSession document
    ref: 'SoundSession' // Name of the referenced model
  }]
}, {
  // ============================================
  // SCHEMA OPTIONS
  // ============================================
  toJSON: { virtuals: true }, // Include virtual fields when converting to JSON
  toObject: { virtuals: true } // Include virtual fields when converting to object
});

// ============================================
// PRE-SAVE MIDDLEWARE - Password Hashing
// ============================================
// This function runs automatically before saving a user document
// It hashes the password for security (never store plain text passwords)
userSchema.pre('save', async function (next) {
  // Only hash password if it was modified (or is new)
  // Skip hashing if password doesn't exist (Google OAuth users)
  if (!this.isModified('password') || !this.password) return next();

  // Generate a salt (random data added to password before hashing)
  // Higher number = more secure but slower (10 is standard)
  const salt = await bcrypt.genSalt(10);
  
  // Hash the password with the salt
  // This creates a one-way hash that can't be reversed
  this.password = await bcrypt.hash(this.password, salt);
  
  next(); // Continue with save operation
});

// ============================================
// INSTANCE METHOD - Password Comparison
// ============================================
// This method compares an entered password with the hashed password
// Used during login to verify user credentials
// Usage: const isMatch = await user.matchPassword('user-entered-password')
userSchema.methods.matchPassword = async function (enteredPassword) {
  // If user has no password (Google OAuth user), return false
  if (!this.password) return false;
  
  // Compare entered password with hashed password
  // bcrypt.compare() hashes the entered password and compares it with stored hash
  return await bcrypt.compare(enteredPassword, this.password);
};

// ============================================
// VIRTUAL PROPERTIES - Populated Relationships
// ============================================
// Virtual fields don't exist in database but are populated on query
// They provide access to related documents through populate()

// Virtual for quiz results data (provides access to full QuizResult documents)
userSchema.virtual('quizResultsData', {
  ref: 'QuizResult', // Reference QuizResult model
  localField: '_id', // Use user's _id field
  foreignField: 'userId' // Match with QuizResult's userId field
});

// Virtual for mood logs data (provides access to full MoodLog documents)
userSchema.virtual('moodLogsData', {
  ref: 'MoodLog', // Reference MoodLog model
  localField: '_id', // Use user's _id field
  foreignField: 'userId' // Match with MoodLog's userId field
});

// Virtual for sound sessions data (provides access to full SoundSession documents)
userSchema.virtual('soundSessionsData', {
  ref: 'SoundSession', // Reference SoundSession model
  localField: '_id', // Use user's _id field
  foreignField: 'userId' // Match with SoundSession's userId field
});

// ============================================
// EXPORT MODEL
// ============================================
// Create and export the User model
// Check if model already exists to prevent OverwriteModelError in development
module.exports = mongoose.models.User || mongoose.model('User', userSchema);

