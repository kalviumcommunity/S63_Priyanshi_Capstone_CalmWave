const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors"); // ✅ Import CORS
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const moodLogRoutes = require("./routes/moodLogRoutes");
const soundSessionRoutes = require("./routes/soundSessionRoutes");
const quizResultRoutes = require("./routes/quizResultRoutes");

dotenv.config();

const app = express();

// ✅ Enable CORS for frontend
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true, // Only needed if you're sending cookies
}));

app.use(express.json());

const PORT = process.env.PORT || 8000;

app.use("/api/users", userRoutes);
app.use('/api/moodlogs', moodLogRoutes);
app.use('/api/soundsessions', soundSessionRoutes);
app.use('/api/quizresults', quizResultRoutes);

// Connect to DB and start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});
