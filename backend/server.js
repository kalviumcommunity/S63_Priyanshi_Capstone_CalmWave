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
  'https://deluxe-pony-f64836.netlify.app', // Explicit frontend URL
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174'
];

console.log('🔒 Allowed CORS origins:', allowedOrigins);

const corsOptions = {
  origin: function (origin, callback) {
    console.log(`🔍 CORS check for origin: ${origin || 'no origin'}`);
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log('✅ Allowing request with no origin');
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      console.log(`✅ CORS allowed for origin: ${origin}`);
      callback(null, true);
    } else {
      console.log(`❌ CORS blocked origin: ${origin}`);
      console.log(`📋 Allowed origins:`, allowedOrigins);
      callback(new Error('Not allowed by CORS'));
    }
  },
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

// Request logging middleware
app.use((req, res, next) => {
  console.log(`🌐 ${req.method} ${req.url} from ${req.headers.origin || 'unknown origin'}`);
  next();
});

// ... [keep the top part unchanged]

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // ✅ Handle preflight globally for all routes

// Body parser
app.use(express.json());

// Session middleware (Google OAuth)
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
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
const authRoutes = require("./routes/authRoutes");

// ✅ Specific CORS middleware for user routes with updated preflight handling
app.use("/api/users", (req, res, next) => {
  console.log(`🔐 User route accessed: ${req.method} ${req.url}`);
  console.log(`Origin: ${req.headers.origin}`);

  const origin = req.headers.origin;

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
    console.log(`✅ CORS headers set for allowed origin: ${origin}`);
  } else if (origin) {
    console.log(`❌ Origin not allowed: ${origin}`);
  }

  // ✅ Updated OPTIONS block to send headers before responding
  if (req.method === 'OPTIONS') {
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
app.use("/api/auth", authRoutes);

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

// DB connection check
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

// Sound session test
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

// Start server
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
