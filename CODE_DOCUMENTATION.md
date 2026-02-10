# CalmWave - Comprehensive Code Documentation

## 📋 Table of Contents
1. [Backend Architecture](#backend-architecture)
2. [Frontend Architecture](#frontend-architecture)
3. [Authentication Flow](#authentication-flow)
4. [Database Models](#database-models)
5. [Key Features](#key-features)
6. [Interview Focus Areas](#interview-focus-areas)

---

## 🔧 Backend Architecture

### **server.js** - Main Backend Entry Point

#### **Purpose:**
- Initializes Express server
- Configures middleware (CORS, sessions, authentication)
- Connects to MongoDB database
- Registers all API routes

#### **Critical Components:**

**1. CORS Configuration**
```javascript
// CORS allows frontend (different domain) to make requests to backend API
const allowedOrigins = [
  'https://deluxe-pony-f64836.netlify.app', // Production frontend
  'http://localhost:5173', // Development frontend
  'http://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true); // Allow request
    } else {
      callback(new Error('Not allowed by CORS')); // Block request
    }
  },
  credentials: true, // Allow cookies and auth headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

**Why This Matters:**
- **Security**: Prevents unauthorized domains from accessing your API
- **Production Ready**: Different configurations for dev/production
- **Credential Support**: Enables cookies for OAuth flow

**2. Session Middleware**
```javascript
app.use(session({
  secret: process.env.SESSION_SECRET, // Secret key from .env
  resave: false, // Don't save unchanged sessions (optimization)
  saveUninitialized: false, // Don't create session until needed (security)
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'lax', // CSRF protection
  }
}));
```

**Why This Matters:**
- Required for Google OAuth flow
- Stores user session data server-side
- Cookie settings prevent security vulnerabilities

**3. Passport Initialization**
```javascript
app.use(passport.initialize()); // Initialize Passport
app.use(passport.session()); // Enable persistent login sessions
```

**Why This Matters:**
- Passport.js handles OAuth authentication
- Manages user serialization/deserialization
- Industry-standard authentication solution

---

## 🔐 Authentication System

### **Passport Configuration** (`config/passport.js`)

#### **Google OAuth Strategy:**
```javascript
passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`,
  },
  async (req, accessToken, refreshToken, profile, done) => {
    // Three scenarios handled:
    
    // 1. User exists with Google ID - Login existing user
    let user = await User.findOne({ googleId: profile.id });
    if (user) return done(null, user);
    
    // 2. User exists with email - Link Google account
    user = await User.findOne({ email: profile.emails[0].value });
    if (user) {
      user.googleId = profile.id;
      await user.save();
      return done(null, user);
    }
    
    // 3. New user - Create account
    user = new User({
      fullName: profile.displayName,
      email: profile.emails[0].value,
      googleId: profile.id,
      googleProfileImage: profile.photos[0].value,
    });
    await user.save();
    return done(null, user);
  }
));
```

**Interview Talking Points:**
- **Flexibility**: Handles existing users and new registrations
- **Account Linking**: Merges OAuth with traditional email/password accounts
- **Data Integrity**: Prevents duplicate accounts

### **JWT Middleware** (`middleware/auth.js`)

#### **Token Verification:**
```javascript
exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  // Check for Bearer token format
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  const token = authHeader.split(' ')[1]; // Extract token
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET); // Verify signature
    req.user = { id: decoded.id }; // Attach user ID to request
    next(); // Allow request to proceed
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    return res.status(401).json({ message: 'Invalid token' });
  }
};
```

**Why This Design:**
- **Stateless Authentication**: No server-side session storage needed
- **Scalability**: Works across multiple servers
- **Security**: Tokens expire after 7 days

---

## 💾 Database Models

### **User Model** (`models/User.js`)

#### **Schema Structure:**
```javascript
const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Optional for OAuth users
  googleId: { type: String, unique: true, sparse: true },
  googleProfileImage: { type: String, default: '' },
  profileImage: { type: String, default: '' },
  
  // Relationships
  quizResults: [{ type: ObjectId, ref: 'QuizResult' }],
  moodLogs: [{ type: ObjectId, ref: 'MoodLog' }],
  soundSessions: [{ type: ObjectId, ref: 'SoundSession' }]
});
```

#### **Password Hashing (Pre-Save Hook):**
```javascript
userSchema.pre('save', async function (next) {
  // Only hash if password modified
  if (!this.isModified('password') || !this.password) return next();
  
  const salt = await bcrypt.genSalt(10); // Generate salt
  this.password = await bcrypt.hash(this.password, salt); // Hash password
  next();
});
```

**Interview Talking Points:**
- **Security**: Never stores plain text passwords
- **Automatic**: Hashing happens automatically before saving
- **One-Way**: Cannot reverse the hash to get original password

#### **Virtual Properties:**
```javascript
userSchema.virtual('quizResultsData', {
  ref: 'QuizResult',
  localField: '_id',
  foreignField: 'userId'
});
```

**Why Virtuals:**
- Don't store redundant data in database
- Populated on-demand with `.populate()`
- Efficient queries with related data

---

## ⚛️ Frontend Architecture

### **App.jsx** - Root Component

```javascript
const App = () => {
  return (
    <Router> {/* Provides routing context */}
      <ThemeProvider> {/* Provides dark/light theme */}
        <AppContent /> {/* Contains all routes */}
      </ThemeProvider>
    </Router>
  );
};
```

**Design Pattern:**
- **Provider Pattern**: Wraps app with context providers
- **Separation of Concerns**: App.jsx handles providers, AppContent handles routes

### **AppContent.jsx** - Route Configuration

```javascript
const AppContent = () => {
  const location = useLocation(); // Track current route
  
  // Stop audio when route changes
  useEffect(() => {
    stopAllAudio(); // Prevent audio from playing on wrong pages
  }, [location]);
  
  return (
    <Routes>
      <Route path="/" element={<ExplorePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/home" element={<Home />} />
      <Route path="/quiz" element={<Quiz />} />
      <Route path="/therapy" element={<Therapy />} />
      <Route path="/profile" element={<ProfileNew />} />
    </Routes>
  );
};
```

**Why This Approach:**
- **Clean Audio Management**: Prevents multiple sounds playing
- **Memory Efficiency**: Cleans up audio objects
- **Better UX**: No confusion from overlapping sounds

---

## 🎯 Key Features

### **1. Anxiety Assessment Quiz** (`pages/QuizPage.jsx`)

#### **GAD-7 Implementation:**
```javascript
const questions = [
  { question: "Feeling nervous, anxious, or on edge", 
    options: ["Not at all", "Several days", "More than half the days", "Nearly every day"] },
  // ... 7 questions total
];

const calculateScore = () => {
  const scoreMap = {
    "Not at all": 0,
    "Several days": 1,
    "More than half the days": 2,
    "Nearly every day": 3,
  };
  
  const total = answers.reduce((acc, answer) => acc + (scoreMap[answer] || 0), 0);
  
  // Interpret score
  let level = "";
  if (total <= 4) level = "Minimal Anxiety";
  else if (total <= 9) level = "Mild Anxiety";
  else if (total <= 14) level = "Moderate Anxiety";
  else level = "Severe Anxiety";
  
  setScore(total);
  setLevel(level);
};
```

**Interview Talking Points:**
- **Medical Standard**: Based on GAD-7 (Generalized Anxiety Disorder-7)
- **Validated Scoring**: Uses clinically validated cutoff points
- **Personalized**: Results guide therapy recommendations

### **2. Sound Therapy Sessions**

#### **Session Tracking:**
```javascript
const soundSessionSchema = new mongoose.Schema({
  userId: { type: ObjectId, ref: 'User' },
  sessionType: {
    type: String,
    enum: ['Recommended', 'Binaural', 'Additional']
  },
  audioName: { type: String, required: true },
  duration: { type: Number, required: true }, // in seconds
  date: { type: Date, default: Date.now }
});
```

**Features:**
- **Categorized**: Different types of therapy sessions
- **Analytics Ready**: Tracks duration and frequency
- **Progress Tracking**: Users can see their therapy history

### **3. Mood Logging System**

```javascript
const moodLogSchema = new mongoose.Schema({
  userId: { type: ObjectId, ref: 'User' },
  mood: { type: String, required: true },
  note: String,
  date: { type: Date, required: true }
});
```

**Benefits:**
- **Emotional Awareness**: Users track their moods over time
- **Pattern Recognition**: Identify triggers and trends
- **Journal Integration**: Notes provide context

---

## 🎤 Interview Focus Areas

### **1. Authentication Architecture**

**Question: "How does your authentication system work?"**

**Answer:**
"We implement a hybrid authentication system supporting both traditional email/password and Google OAuth:

1. **Email/Password Flow:**
   - Passwords are hashed using bcrypt with salt rounds of 10
   - JWT tokens issued on login, valid for 7 days
   - Tokens include user ID in payload, signed with secret key

2. **Google OAuth Flow:**
   - User clicks 'Login with Google' → redirects to Google
   - Google authenticates and returns to our callback URL
   - Passport.js processes profile, creates/links user account
   - Generates JWT token and session ID
   - Redirects to frontend with session ID in URL
   - Frontend fetches token from session endpoint (one-time use)
   - Token stored in localStorage for API requests

3. **Security Measures:**
   - HTTP-only cookies for session IDs (XSS protection)
   - CORS whitelist for allowed origins
   - Token expiration and validation
   - bcrypt for password hashing (one-way encryption)"

### **2. Database Design**

**Question: "Explain your database schema and relationships"**

**Answer:**
"We use MongoDB with Mongoose ODM. Our schema has four main models:

1. **User Model (Central Hub):**
   - Stores user credentials and profile data
   - Has arrays of ObjectId references to related data
   - Uses virtual properties for efficient querying
   - Pre-save hook automatically hashes passwords

2. **Relationships:**
   - One-to-Many: One user has many quiz results, mood logs, sessions
   - Implemented using ObjectId references
   - Virtual properties enable `.populate()` for joining data
   - Example: `user.populate('quizResultsData')` fetches all quiz results

3. **Why MongoDB:**
   - Flexible schema for rapid development
   - Good for user-generated content (mood logs, notes)
   - Easy to add new fields without migrations
   - JSON-like documents match JavaScript objects

4. **Optimization:**
   - Indexed fields (email, googleId) for fast lookups
   - Sparse index on googleId allows null values
   - Virtuals prevent data duplication"

### **3. CORS and Security**

**Question: "How do you handle CORS and security?"**

**Answer:**
"Security is implemented at multiple layers:

1. **CORS Configuration:**
   - Whitelist specific frontend URLs (production and development)
   - Dynamic origin checking function
   - Credentials enabled for cookie support
   - Preflight OPTIONS requests handled explicitly

2. **Authentication Security:**
   - JWT tokens with expiration (7 days)
   - Tokens sent in Authorization header (not localStorage for sensitive data)
   - Session IDs in HTTP-only cookies (JavaScript can't access)
   - One-time use session endpoints (deleted after fetching)

3. **Password Security:**
   - bcrypt hashing with 10 salt rounds
   - Never store plain text passwords
   - Password optional for OAuth users

4. **Authorization:**
   - verifyToken middleware protects routes
   - isResourceOwner prevents users accessing others' data
   - User ID extracted from token, not request body (prevents tampering)"

### **4. State Management**

**Question: "How do you manage application state?"**

**Answer:**
"We use a combination of strategies:

1. **localStorage for Authentication:**
   - Stores JWT token, userId, user profile data
   - Persists across page refreshes
   - Checked on app load to maintain login state

2. **React useState for Component State:**
   - Form inputs, loading states, error messages
   - Scoped to individual components
   - Example: Quiz answers, current question index

3. **Context API for Global State:**
   - Theme context (dark/light mode)
   - Provides theme to all components without prop drilling
   - ThemeProvider wraps entire app

4. **Audio Context for Sound Management:**
   - Global audio object to prevent multiple sounds playing
   - stopAllAudio() function cleans up audio on route changes
   - Prevents memory leaks from orphaned audio elements"

### **5. User Experience Design**

**Question: "What UX considerations did you implement?"**

**Answer:**
"We focused on several UX principles:

1. **Audio Management:**
   - Stops all audio when navigating between pages
   - Prevents confusion from overlapping sounds
   - beforeunload event stops audio on tab close

2. **Error Handling:**
   - Specific error messages (token expired, network error, invalid credentials)
   - Try-catch blocks with user-friendly messages
   - Loading states during API calls

3. **Progressive Disclosure:**
   - Quiz shows one question at a time
   - Previous results available on demand
   - Therapy recommendations based on quiz results

4. **Accessibility:**
   - Form labels for screen readers
   - Semantic HTML elements
   - Keyboard navigation support

5. **Performance:**
   - Lazy loading components
   - Efficient database queries with populate()
   - Virtual properties avoid data duplication"

---

## 📊 Technical Stack Summary

### **Backend:**
- **Framework**: Express.js (Node.js)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Passport.js (Google OAuth), JWT
- **Security**: bcrypt, CORS, express-session
- **Environment**: dotenv for config management

### **Frontend:**
- **Framework**: React with Vite
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Styling**: CSS Modules
- **State**: useState, Context API, localStorage

### **Deployment:**
- **Frontend**: Netlify
- **Backend**: (Render/Heroku - based on your setup)
- **Database**: MongoDB Atlas

---

## 🚀 Development Best Practices Demonstrated

1. **Separation of Concerns**: Routes, models, middleware in separate files
2. **Environment Variables**: Sensitive data in .env file
3. **Error Handling**: Try-catch blocks with specific error messages
4. **Code Comments**: Inline documentation for complex logic
5. **DRY Principle**: Reusable middleware and utility functions
6. **Security First**: Password hashing, token validation, CORS
7. **Scalability**: Stateless JWT authentication, modular architecture

---

## 💡 Key Interview Talking Points

1. **Full-Stack Integration**: "I built a complete authentication flow from frontend OAuth button to backend database storage"

2. **Security Awareness**: "I implemented multiple security layers including password hashing, token validation, and CORS configuration"

3. **Database Design**: "I designed a relational schema in MongoDB using references and virtual properties for efficient data retrieval"

4. **User Experience**: "I focused on audio management and error handling to provide a smooth user experience"

5. **Production Ready**: "The application has separate development and production configurations with environment variables"

6. **Problem Solving**: "I solved the OAuth redirect challenge by implementing a temporary session store with one-time use tokens"

---

**This documentation covers the most critical components likely to be discussed in technical interviews. Each section includes code examples, explanations, and talking points to help you confidently discuss your implementation decisions.**
