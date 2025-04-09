const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

<<<<<<< main
=======
const userRoutes = require("./routes/userRoutes");
const moodLogRoutes = require('./routes/moodLogRoutes');
const soundSessionRoutes = require('./routes/soundSessionRoutes');
const quizResultRoutes = require('./routes/quizResultRoutes');

>>>>>>> local
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8000;

<<<<<<< main
=======
app.use("/api/users", userRoutes);
app.use('/api/moodlogs', moodLogRoutes);
app.use('/api/soundsessions', soundSessionRoutes);
app.use('/api/quizresults', quizResultRoutes);


>>>>>>> local
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection failed:', error.message);
  });
  
