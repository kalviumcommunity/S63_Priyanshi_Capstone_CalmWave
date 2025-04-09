const mongoose = require("mongoose");

const quizResultSchema = new mongoose.Schema({
  userId: String,
  score: Number,
  level: String, // like "low", "medium", "high"
  date: String,
});

module.exports = mongoose.model("QuizResult", quizResultSchema);
