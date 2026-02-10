// ============================================
// MOOD LOG MODEL - MongoDB Schema Definition
// ============================================
// This file defines the MoodLog schema for tracking user moods
// Used in the journaling feature to record daily emotional states

const mongoose = require('mongoose'); // MongoDB ODM library

// ============================================
// MOOD LOG SCHEMA DEFINITION
// ============================================
// Define the structure of mood log documents in MongoDB
const moodLogSchema = new mongoose.Schema({
  // Reference to the user who created this mood log
  // Links this mood log to a specific user in the User collection
  userId: {
    type: mongoose.Schema.Types.ObjectId, // MongoDB ObjectId type
    ref: 'User', // References the User model (must match model name exactly)
    required: false // Optional to allow anonymous mood tracking (not recommended for production)
  },
  
  // The mood/emotion recorded by the user
  // Examples: "Happy", "Sad", "Anxious", "Calm", "Stressed"
  mood: {
    type: String, // String data type
    required: true // This field is mandatory when creating a mood log
  },
  
  // Optional notes or journal entry associated with the mood
  // Allows users to add context or details about their emotional state
  note: String, // String type, not required
  
  // Date when this mood was recorded
  // Allows tracking mood patterns over time
  date: {
    type: Date, // Date object type
    required: true // Date is mandatory for temporal analysis
  }
});

// ============================================
// EXPORT MODEL
// ============================================
// Create and export the MoodLog model
// Collection name in MongoDB will be "moodlogs" (lowercase, pluralized)
module.exports = mongoose.model('MoodLog', moodLogSchema);
