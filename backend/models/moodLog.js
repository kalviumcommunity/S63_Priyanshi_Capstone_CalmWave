const mongoose = require("mongoose");

const moodLogSchema = new mongoose.Schema({
  userId: String,
  mood: String,
  note: String,
  date: String, // e.g., "2025-04-09"
});

module.exports = mongoose.model("MoodLog", moodLogSchema);
