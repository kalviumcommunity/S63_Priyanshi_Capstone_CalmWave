const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

<<<<<<< HEAD
<<<<<<< main
=======
const userRoutes = require("./routes/userRoutes");
const moodLogRoutes = require('./routes/moodLogRoutes');
const soundSessionRoutes = require('./routes/soundSessionRoutes');
const quizResultRoutes = require('./routes/quizResultRoutes');

>>>>>>> local
=======
const userRoutes = require("./routes/userRoutes");

>>>>>>> b78b54d3539222f65b7e20d55d321decc979489d
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8000;

<<<<<<< HEAD
<<<<<<< main
=======
app.use("/api/users", userRoutes);
app.use('/api/moodlogs', moodLogRoutes);
app.use('/api/soundsessions', soundSessionRoutes);
app.use('/api/quizresults', quizResultRoutes);


>>>>>>> local
=======
app.use("/api/users", userRoutes);

>>>>>>> b78b54d3539222f65b7e20d55d321decc979489d
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });
