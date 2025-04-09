const mongoose = require("mongoose");

const soundSessionSchema = new mongoose.Schema({
  userId: String,
  frequency: Number,
  duration: Number, // in minutes
  date: String,
});

module.exports = mongoose.model("SoundSession", soundSessionSchema);
