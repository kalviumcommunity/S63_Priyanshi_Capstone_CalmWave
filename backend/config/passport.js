// ============================================
// PASSPORT.JS CONFIGURATION - Google OAuth 2.0
// ============================================
// This file configures Google OAuth authentication using Passport.js
// It handles user authentication, user creation, and account linking

const passport = require('passport'); // Authentication middleware
const GoogleStrategy = require('passport-google-oauth20').Strategy; // Google OAuth strategy
const User = require('../models/User'); // User model for database operations

// ============================================
// GOOGLE OAUTH STRATEGY CONFIGURATION
// ============================================
// Configure how Passport handles Google OAuth authentication
passport.use(new GoogleStrategy(
  {
    // Google OAuth credentials from environment variables (.env file)
    clientID: process.env.GOOGLE_CLIENT_ID, // OAuth client ID from Google Cloud Console
    clientSecret: process.env.GOOGLE_CLIENT_SECRET, // OAuth client secret from Google Cloud Console
    callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`, // Where Google redirects after authentication
    passReqToCallback: true, // Pass request object to callback function
  },
  // ============================================
  // VERIFICATION CALLBACK - Called after Google authentication
  // ============================================
  // This function is called when Google successfully authenticates a user
  // Parameters:
  // - req: Express request object
  // - accessToken: Token to access Google APIs (not used here)
  // - refreshToken: Token to refresh access token (not used here)
  // - profile: User's Google profile information
  // - done: Callback function to complete authentication
  async (req, accessToken, refreshToken, profile, done) => {
    try {
      console.log('✅ Google OAuth Callback for:', profile?.emails?.[0]?.value);

      // Extract profile image URL from Google profile
      const profileImage = profile?.photos?.[0]?.value || '';
      // Extract email address from Google profile
      const email = profile?.emails?.[0]?.value;

      // Validate that Google provided an email
      if (!email) {
        console.error('❌ No email provided by Google');
        return done(new Error('No email provided by Google'), null);
      }

      // ============================================
      // SCENARIO 1: Check if user exists by Google ID
      // ============================================
      // Look for existing user with this Google account
      let user = await User.findOne({ googleId: profile.id });

      if (user) {
        // User already linked with this Google account
        // Update profile image if it has changed
        if (profileImage && profileImage !== user.googleProfileImage) {
          user.googleProfileImage = profileImage; // Update image URL
          await user.save(); // Save to database
          console.log('🔄 Updated user profile image');
        }
        console.log('🔎 Existing user found by Google ID:', user.email);
        return done(null, user); // Authentication successful, return user
      }

      // ============================================
      // SCENARIO 2: Check if user exists by email
      // ============================================
      // User might have registered with email/password before
      user = await User.findOne({ email });

      if (user) {
        // User exists with this email but hasn't linked Google account yet
        // Link this Google account to existing user
        user.googleId = profile.id; // Store Google ID
        user.googleProfileImage = profileImage; // Store Google profile image
        await user.save(); // Save to database
        console.log('🔗 Linked Google account to existing user:', user.email);
        return done(null, user); // Authentication successful, return user
      }

      // ============================================
      // SCENARIO 3: Create new user
      // ============================================
      // User doesn't exist in database, create new account
      user = new User({
        fullName: profile.displayName, // User's name from Google
        email, // User's email from Google
        googleId: profile.id, // Google account ID
        googleProfileImage: profileImage, // Google profile image URL
      });

      await user.save(); // Save new user to database
      console.log('🆕 New user created via Google OAuth:', user.email);
      return done(null, user); // Authentication successful, return new user
    } catch (err) {
      // Handle any errors during authentication
      console.error('❌ Passport Google OAuth error:', err);
      return done(err, null); // Authentication failed, return error
    }
  }
));

// ============================================
// SERIALIZE USER - Store user in session
// ============================================
// Called when user logs in - stores user ID in session
// This minimizes session data by only storing the user ID
passport.serializeUser((user, done) => {
  done(null, user.id); // Store only user ID in session (not entire user object)
});

// ============================================
// DESERIALIZE USER - Retrieve user from session
// ============================================
// Called on each request - retrieves full user object from database
// Uses the user ID stored in session to fetch complete user data
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id); // Find user by ID from session
    done(null, user); // Attach user object to req.user
  } catch (err) {
    console.error('Error deserializing user:', err);
    done(err, null); // Error retrieving user
  }
});
