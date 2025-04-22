const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const connectDB = require("./config/db");

// Route imports
const userRoutes = require("./routes/userRoutes");
const moodLogRoutes = require("./routes/moodLogRoutes");
const soundSessionRoutes = require("./routes/soundSessionRoutes");
const quizResultRoutes = require("./routes/quizResultRoutes");
const uploadRoutes = require("./routes/upload");
const authRoutes = require("./routes/authRoutes"); // ✅ NEW

dotenv.config();
require("./config/passport"); // ✅ Load passport config

const app = express();

// Enable CORS for frontend
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

// Body parser
app.use(express.json());

// Session middleware (required for passport)
require('dotenv').config();

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}));


// Initialize passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Static folder for uploaded images
app.use('/uploads', express.static('uploads'));

// Routes
app.use("/api/users", userRoutes);
app.use('/api/moodlogs', moodLogRoutes);
app.use('/api/soundsessions', soundSessionRoutes);
app.use('/api/quizresults', quizResultRoutes);
app.use('/api', uploadRoutes);
app.use('/auth', authRoutes); // ✅ Google OAuth route

// Connect to DB and start server
const PORT = process.env.PORT || 8000;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});
