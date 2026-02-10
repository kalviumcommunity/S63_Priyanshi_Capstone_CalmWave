// ============================================
// QUIZ RESULT MODEL - MongoDB Schema Definition
// ============================================
// This file defines the QuizResult schema for storing anxiety quiz results
// Tracks user anxiety levels and assessment history over time

const mongoose = require("mongoose"); // MongoDB ODM library

// ============================================
// QUIZ RESULT SCHEMA DEFINITION
// ============================================
// Define the structure of quiz result documents in MongoDB
const quizResultSchema = new mongoose.Schema({
  // Reference to the user who took the quiz
  // Links this quiz result to a specific user in the User collection
  userId: {
    type: mongoose.Schema.Types.ObjectId, // MongoDB ObjectId type
    ref: 'User', // References the User model
    required: false // Optional to allow anonymous quiz taking (not recommended for production)
  },
  
  // Numerical score from the anxiety assessment quiz
  // Based on GAD-7 (Generalized Anxiety Disorder 7-item scale)
  // Score range: 0-21 (0=minimal anxiety, 21=severe anxiety)
  score: Number, // Total score from quiz answers
  
  // Categorical anxiety level based on score
  // Possible values: "Minimal Anxiety", "Mild Anxiety", "Moderate Anxiety", "Severe Anxiety"
  // Used to provide user-friendly interpretation of numerical score
  level: String, // Anxiety severity level
  
  // Date when the quiz was taken
  // Allows tracking anxiety trends over time
  date: {
    type: Date, // Date object type
    default: Date.now // Automatically set to current date/time when document created
  },
  
  // Timestamp of when this document was created in the database
  // Useful for sorting and filtering results chronologically
  createdAt: {
    type: Date, // Date object type
    default: Date.now // Automatically set to current date/time
  }
});

// ============================================
// EXPORT MODEL
// ============================================
// Create and export the QuizResult model
// Collection name in MongoDB will be "quizresults" (lowercase, pluralized)
module.exports = mongoose.model("QuizResult", quizResultSchema);
