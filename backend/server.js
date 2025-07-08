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
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  exposedHeaders: ['Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Handle preflight OPTIONS requests explicitly
app.options('*', cors(corsOptions));

// Additional CORS headers middleware (fallback)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Log CORS requests for debugging
  console.log(`CORS Request - Method: ${req.method}, Origin: ${origin}, URL: ${req.url}`);
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    console.log(`✅ CORS allowed for origin: ${origin}`);
  } else {
    console.log(`❌ CORS blocked for origin: ${origin}`);
    console.log(`Allowed origins:`, allowedOrigins);
  }
  
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.setHeader('Access-Control-Expose-Headers', 'Authorization');
  
  if (req.method === 'OPTIONS') {
    console.log(`✅ Handling OPTIONS preflight request for ${req.url}`);
    res.status(200).end();
    return;
  }
  next();
});

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
  });
});
