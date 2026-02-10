// ============================================
// SERVER.JS - Main Backend Entry Point
// ============================================
// This file initializes the Express server, configures middleware,
// sets up authentication, and connects to MongoDB database

// Import required npm packages
const express = require("express"); // Web framework for Node.js
const dotenv = require("dotenv"); // Loads environment variables from .env file
const cors = require("cors"); // Enables Cross-Origin Resource Sharing for frontend-backend communication
const session = require("express-session"); // Manages user sessions for OAuth
const passport = require("passport"); // Authentication middleware for Google OAuth
const mongoose = require("mongoose"); // MongoDB object modeling tool
const connectDB = require("./config/db"); // Custom database connection function

// Load environment variables from .env file into process.env
// This makes sensitive data like API keys, database URLs accessible
dotenv.config();

// Load Passport configuration for Google OAuth authentication
// This must be loaded before passport.initialize()
require("./config/passport"); // ✅ Load Passport configuration

// Initialize Express application
// Initialize Express application
const app = express();

// ============================================
// CORS CONFIGURATION - Critical for Security
// ============================================
// CORS (Cross-Origin Resource Sharing) allows the frontend (different domain)
// to make requests to this backend API

// Define allowed origins (frontends that can access this API)
// In production, only specific domains should be whitelisted
const allowedOrigins = [
  'https://deluxe-pony-f64836.netlify.app', // Production frontend on Netlify
  'http://localhost:5173', // Local development (Vite default port)
  'http://localhost:3000' // Alternative local development port
];

// Configure CORS middleware with custom origin checking function
app.use(cors({
  // origin: Function to validate if incoming request origin is allowed
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    // This is necessary for non-browser clients
    if (!origin) return callback(null, true);
    
    // Check if the request origin exists in our allowedOrigins array
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true); // Origin is allowed, proceed with request
    } else {
      callback(new Error('Not allowed by CORS')); // Reject unauthorized origin
    }
  },
  credentials: true, // Allow cookies and authorization headers to be sent
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed request headers
}));

// ============================================
// PREFLIGHT REQUESTS - Handle OPTIONS Method
// ============================================
// Browsers send OPTIONS requests before actual requests (preflight)
// to check if the server allows the cross-origin request
// This explicitly handles all OPTIONS requests across all routes
app.options('*', cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // Allow requests without origin
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true); // Origin is allowed
    } else {
      callback(new Error('Not allowed by CORS')); // Origin is blocked
    }
  },
  credentials: true, // Allow credentials in preflight requests
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Methods allowed
  allowedHeaders: ['Content-Type', 'Authorization'], // Headers allowed
}));

// ============================================
// BODY PARSER MIDDLEWARE
// ============================================
// Parse incoming JSON request bodies and make data available in req.body
// This is essential for processing POST/PUT requests with JSON data
app.use(express.json());

// ============================================
// SESSION MIDDLEWARE - For Google OAuth
// ============================================
// express-session creates and manages user sessions
// Required for Passport.js OAuth flow to work properly
app.use(session({
  secret: process.env.SESSION_SECRET, // Secret key to sign session ID cookie (must be in .env)
  resave: false, // Don't save session if unmodified (optimization)
  saveUninitialized: false, // Don't create session until something is stored (security)
  cookie: {
    secure: process.env.NODE_ENV === 'production', // true in production (HTTPS required), false in development
    sameSite: 'lax', // CSRF protection while allowing top-level navigation
  }
}));

// ============================================
// PASSPORT.JS MIDDLEWARE - Authentication
// ============================================
// Initialize Passport.js for authentication
app.use(passport.initialize()); // Initialize passport authentication
app.use(passport.session()); // Enable persistent login sessions

// ============================================
// STATIC FILE SERVING
// ============================================
// Serve uploaded files (user profile images) from the 'uploads' directory
// Accessible via URL: http://localhost:8000/uploads/filename.jpg
app.use('/uploads', express.static('uploads'));

// ============================================
// ROUTE DEBUGGING (Development Only)
// ============================================
// Logs all registered routes to console for debugging purposes
// Helps developers verify which routes are properly registered
console.log('🛠 ROUTE DEBUG START');
app._router.stack.forEach((r) => {
  if (r.route && r.route.path) {
    console.log('➡️ Route registered:', r.route.path); // Print each route path
  }
});
console.log('🛠 ROUTE DEBUG END');


// ============================================
// ROUTE IMPORTS - Import route handlers
// ============================================
// Import all route modules from the routes directory
// Each module handles a specific resource/feature
const userRoutes = require("./routes/userRoutes"); // User authentication, registration, profile
const moodLogRoutes = require("./routes/moodLogRoutes"); // Mood tracking and journaling
const soundSessionRoutes = require("./routes/soundSessionRoutes"); // Sound therapy sessions
const quizResultRoutes = require("./routes/quizResultRoutes"); // Anxiety quiz results
const uploadRoutes = require("./routes/upload"); // File upload handling (profile images)
const authRoutes = require("./routes/authRoutes"); // Google OAuth authentication routes
// Removed AI mood routes (not implemented) (not implemented)

// ============================================
// ROUTE MOUNTING - Register routes with base paths
// ============================================
// Mount imported route modules to specific base URLs
// All routes in each module will be prefixed with these base paths
app.use("/api/users", userRoutes); // User routes: /api/users/register, /api/users/login, etc.
app.use("/api/moodlogs", moodLogRoutes); // Mood log routes: /api/moodlogs (GET, POST, PUT, DELETE)
app.use("/api/soundsessions", soundSessionRoutes); // Sound session routes: /api/soundsessions
app.use("/api/quizresults", quizResultRoutes); // Quiz result routes: /api/quizresults
app.use("/api", uploadRoutes); // Upload routes: /api/upload (file upload endpoint)
app.use("/api/auth", authRoutes); // Google OAuth routes: /api/auth/google, /api/auth/google/callback
// Removed /api/ai routes (AI mood analysis not implemented)


// ============================================
// ROOT ROUTE - Health Check Endpoint
// ============================================
// Simple GET endpoint to verify the server is running
// Accessible at: http://localhost:8000/
app.get('/', (req, res) => {
  res.send('🎉 CalmWave backend is running!'); // Send success message
});

// ============================================
// DATABASE CONNECTION TEST ROUTE
// ============================================
// Test endpoint to verify MongoDB connection status
// Returns connection state and database name
// Accessible at: http://localhost:8000/api/test-db
app.get('/api/test-db', async (req, res) => {
  try {
    // readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    if (mongoose.connection.readyState === 1) {
      res.json({
        status: 'success',
        message: 'MongoDB is connected',
        connectionState: mongoose.connection.readyState, // Should be 1 if connected
        dbName: mongoose.connection.db.databaseName // Name of the connected database
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: 'MongoDB is not connected',
        connectionState: mongoose.connection.readyState // Current connection state
      });
    }
  } catch (err) {
    console.error('Error testing DB connection:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// ============================================
// SOUND SESSION TEST ROUTE (Development Only)
// ============================================
// Creates a dummy sound session to test database write operations
// Useful for verifying the SoundSession model and database connection
// Accessible at: http://localhost:8000/api/test-sound-session
app.get('/api/test-sound-session', async (req, res) => {
  try {
    const SoundSession = require('./models/SoundSession'); // Import SoundSession model
    const testUserId = new mongoose.Types.ObjectId(); // Generate a random ObjectId for userId
    
    // Create a new sound session document
    const testSession = new SoundSession({
      userId: testUserId, // Random user ID (not linked to actual user)
      sessionType: 'Test', // Type of therapy session
      audioName: 'Test Audio', // Name of audio file
      duration: 60 // Duration in seconds
    });

    const savedSession = await testSession.save(); // Save to database
    res.json({
      status: 'success',
      message: 'Test sound session created',
      session: savedSession // Return the created session
    });
  } catch (err) {
    console.error('Error creating test sound session:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// ============================================
// SERVER INITIALIZATION
// ============================================
// Connect to MongoDB database and start Express server

// Get PORT from environment variables or default to 8000
const PORT = process.env.PORT || 8000;

// Connect to MongoDB first, then start the server
// This ensures database is ready before accepting requests
connectDB().then(() => {
  // Start Express server and listen on specified PORT
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`); // Log server startup
  });
});
