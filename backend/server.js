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
const allowedOrigins = [
  process.env.FRONTEND_URL || 'https://deluxe-pony-f64836.netlify.app',
  'http://localhost:3000',
  'http://localhost:5173'
];

const corsOptions = {
  origin: true, // Temporarily allow all origins for debugging
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers'
  ],
  exposedHeaders: ['Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 200
};

// Emergency CORS fix - allow all origins temporarily
app.use((req, res, next) => {
  console.log(`🌐 ${req.method} ${req.url} from ${req.headers.origin || 'unknown origin'}`);
  
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept,Authorization');
  
  if (req.method === 'OPTIONS') {
    console.log(`✅ OPTIONS preflight handled for ${req.url}`);
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(cors(corsOptions));

// Body parser
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.url} - Origin: ${req.headers.origin || 'No origin'}`);
  next();
});

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




// Route imports
const userRoutes = require("./routes/userRoutes");
const moodLogRoutes = require("./routes/moodLogRoutes");
const soundSessionRoutes = require("./routes/soundSessionRoutes");
const quizResultRoutes = require("./routes/quizResultRoutes");
const uploadRoutes = require("./routes/upload");
const authRoutes = require("./routes/authRoutes"); // ✅ Google OAuth route


// Specific CORS middleware for user routes
app.use("/api/users", (req, res, next) => {
  console.log(`🔐 User route accessed: ${req.method} ${req.url}`);
  console.log(`Origin: ${req.headers.origin}`);
  console.log(`Headers:`, req.headers);
  
  // Ensure CORS headers are set
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  
  if (req.method === 'OPTIONS') {
    console.log(`✅ Preflight for user route: ${req.url}`);
    return res.status(200).end();
  }
  
  next();
});

// Routes
app.use("/api/users", userRoutes);
app.use("/api/moodlogs", moodLogRoutes);
app.use("/api/soundsessions", soundSessionRoutes);
app.use("/api/quizresults", quizResultRoutes);
app.use("/api", uploadRoutes);
app.use("/api/auth", authRoutes); // ✅ Google OAuth routes


// Home route
app.get('/', (req, res) => {
  res.send('🎉 CalmWave backend is running!');
});

// CORS test route
app.get('/api/cors-test', (req, res) => {
  res.json({
    message: 'CORS is working!',
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
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
    console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);
    console.log(`🔗 Backend URL: ${process.env.BACKEND_URL}`);
    console.log(`🔒 CORS enabled for origins:`, allowedOrigins);
    console.log(`📝 Environment: ${process.env.NODE_ENV}`);
  });
});
