const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// Google OAuth Strategy configuration

passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`,
    passReqToCallback: true,
  },
  async (req, accessToken, refreshToken, profile, done) => {
    try {
      console.log('✅ Google OAuth Callback for:', profile?.emails?.[0]?.value);

      const profileImage = profile?.photos?.[0]?.value || '';
      const email = profile?.emails?.[0]?.value;

      if (!email) {
        console.error('❌ No email provided by Google');
        return done(new Error('No email provided by Google'), null);
      }

      // Check if user exists by Google ID
      let user = await User.findOne({ googleId: profile.id });

      if (user) {
        // Update profile image if changed
        if (profileImage && profileImage !== user.googleProfileImage) {
          user.googleProfileImage = profileImage;
          await user.save();
          console.log('🔄 Updated user profile image');
        }
        console.log('🔎 Existing user found by Google ID:', user.email);
        return done(null, user);
      }

      // Check if user exists by email (from regular registration)
      user = await User.findOne({ email });

      if (user) {
        // Link Google account to existing user
        user.googleId = profile.id;
        user.googleProfileImage = profileImage;
        await user.save();
        console.log('🔗 Linked Google account to existing user:', user.email);
        return done(null, user);
      }

      // Create new user
      user = new User({
        fullName: profile.displayName,
        email,
        googleId: profile.id,
        googleProfileImage: profileImage,
      });

      await user.save();
      console.log('🆕 New user created via Google OAuth:', user.email);
      return done(null, user);
    } catch (err) {
      console.error('❌ Passport Google OAuth error:', err);
      return done(err, null);
    }
  }
));

// Serialize user to store in session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    console.error('Error deserializing user:', err);
    done(err, null);
  }
});
