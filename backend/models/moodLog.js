const mongoose = require('mongoose');

const moodLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // 👈 Must match the model name of your user schema
    required: false // Made optional for anonymous users
  },
  mood: {
    type: String,
    required: true
  },
  note: String,
  date: {
    type: Date,
    required: true
  }
});

module.exports = mongoose.model('MoodLog', moodLogSchema);
