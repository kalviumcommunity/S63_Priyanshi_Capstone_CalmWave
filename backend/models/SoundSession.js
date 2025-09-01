const mongoose = require("mongoose");

const soundSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Made optional for anonymous users
  },
  sessionType: {
    type: String,
    enum: ['Recommended', 'Binaural', 'Additional'],
    required: true
  },
  audioName: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("SoundSession", soundSessionSchema);
