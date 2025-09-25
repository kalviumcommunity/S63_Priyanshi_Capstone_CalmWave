const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const mongoose = require("mongoose");
const connectDB = require("./config/db");



dotenv.config();
require("./config/passport"); // ✅ Load Passport configuration

const app = express();

// Enable CORS for frontend
const allowedOrigin = 'https://deluxe-pony-f64836.netlify.app';

app.use(cors({
  origin: allowedOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Handle preflight OPTIONS requests
app.options('*', cors({
  origin: allowedOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parser
app.use(express.json());

// Session middleware (Google OAuth)
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // true in production (HTTPS)
    sameSite: 'lax',
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());
app.use('/uploads', express.static('uploads'));

console.log('🛠 ROUTE DEBUG START');
app._router.stack.forEach((r) => {
  if (r.route && r.route.path) {
    console.log('➡️ Route registered:', r.route.path);
  }
});
console.log('🛠 ROUTE DEBUG END');


// Route imports
const userRoutes = require("./routes/userRoutes");
const moodLogRoutes = require("./routes/moodLogRoutes");
const soundSessionRoutes = require("./routes/soundSessionRoutes");
const quizResultRoutes = require("./routes/quizResultRoutes");
const uploadRoutes = require("./routes/upload");
const authRoutes = require("./routes/authRoutes"); // ✅ Google OAuth route
// Removed AI mood routes

// Routes
app.use("/api/users", userRoutes);
app.use("/api/moodlogs", moodLogRoutes);
app.use("/api/soundsessions", soundSessionRoutes);
app.use("/api/quizresults", quizResultRoutes);
app.use("/api", uploadRoutes);
app.use("/api/auth", authRoutes); // ✅ Google OAuth routes
// Removed /api/ai routes


// Home route
app.get('/', (req, res) => {
  res.send('🎉 CalmWave backend is running!');
});

// Test DB connection route
app.get('/api/test-db', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      res.json({
        status: 'success',
        message: 'MongoDB is connected',
        connectionState: mongoose.connection.readyState,
        dbName: mongoose.connection.db.databaseName
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: 'MongoDB is not connected',
        connectionState: mongoose.connection.readyState
      });
    }
  } catch (err) {
    console.error('Error testing DB connection:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Test route to create a dummy sound session
app.get('/api/test-sound-session', async (req, res) => {
  try {
    const SoundSession = require('./models/SoundSession');
    const testUserId = new mongoose.Types.ObjectId();
    const testSession = new SoundSession({
      userId: testUserId,
      sessionType: 'Test',
      audioName: 'Test Audio',
      duration: 60
    });

    const savedSession = await testSession.save();
    res.json({
      status: 'success',
      message: 'Test sound session created',
      session: savedSession
    });
  } catch (err) {
    console.error('Error creating test sound session:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Connect to DB and start server
const PORT = process.env.PORT || 8000;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});
