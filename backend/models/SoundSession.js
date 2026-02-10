// ============================================
// SOUND SESSION MODEL - MongoDB Schema Definition
// ============================================
// This file defines the SoundSession schema for tracking sound therapy sessions
// Records which therapeutic audio sessions users have completed

const mongoose = require("mongoose"); // MongoDB ODM library

// ============================================
// SOUND SESSION SCHEMA DEFINITION
// ============================================
// Define the structure of sound session documents in MongoDB
const soundSessionSchema = new mongoose.Schema({
  // Reference to the user who completed this sound therapy session
  // Links this session to a specific user in the User collection
  userId: {
    type: mongoose.Schema.Types.ObjectId, // MongoDB ObjectId type
    ref: 'User', // References the User model
    required: false // Optional to allow anonymous session tracking (not recommended for production)
  },
  
  // Type/category of the sound therapy session
  // Categorizes sessions into different therapeutic approaches
  sessionType: {
    type: String, // String data type
    enum: ['Recommended', 'Binaural', 'Additional'], // Only these values are allowed
    // 'Recommended': Curated sessions based on user's anxiety level
    // 'Binaural': Binaural beat therapy for brainwave entrainment
    // 'Additional': Other therapeutic sound options
    required: true // Session type is mandatory
  },
  
  // Name of the audio file or therapy session
  // Identifies which specific sound/music was used
  // Examples: "Ocean Waves", "Forest Rain", "432Hz Healing"
  audioName: {
    type: String, // String data type
    required: true // Audio name is mandatory
  },
  
  // Duration of the session in seconds
  // Tracks how long the user engaged with the therapy
  // Used for analytics and progress tracking
  duration: {
    type: Number, // Numeric data type (in seconds)
    required: true // Duration is mandatory
  },
  
  // Date when this session was completed
  // Allows tracking therapy engagement patterns over time
  date: {
    type: Date, // Date object type
    default: Date.now // Automatically set to current date/time when document created
  },
  
  // Timestamp of when this document was created in the database
  // Useful for sorting and filtering sessions chronologically
  createdAt: {
    type: Date, // Date object type
    default: Date.now // Automatically set to current date/time
  }
});

// ============================================
// EXPORT MODEL
// ============================================
// Create and export the SoundSession model
// Collection name in MongoDB will be "soundsessions" (lowercase, pluralized)
module.exports = mongoose.model("SoundSession", soundSessionSchema);
