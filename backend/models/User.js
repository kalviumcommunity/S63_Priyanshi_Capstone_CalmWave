const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Optional for Google users
  googleId: { type: String, unique: true, sparse: true },
  googleProfileImage: { type: String, default: '' }, // Store Google profile image URL
  profileImage: {
    type: String,
    default: ''
  },
  // Reference fields to related data
  quizResults: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QuizResult'
  }],
  moodLogs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MoodLog'
  }],
  soundSessions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SoundSession'
  }]
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Hash password before saving (only if password exists and modified)
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

// Virtual for quiz results
userSchema.virtual('quizResultsData', {
  ref: 'QuizResult',
  localField: '_id',
  foreignField: 'userId'
});

// Virtual for mood logs
userSchema.virtual('moodLogsData', {
  ref: 'MoodLog',
  localField: '_id',
  foreignField: 'userId'
});

// Virtual for sound sessions
userSchema.virtual('soundSessionsData', {
  ref: 'SoundSession',
  localField: '_id',
  foreignField: 'userId'
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema);

