const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const userRoutes = require('./routes/userRoutes');
const app = express();
app.use(express.json());
const PORT = process.env.PORT || 8000;
app.use('/api/users', userRoutes);
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
  
