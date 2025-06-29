const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// Optional: Override tokenParams for debugging
GoogleStrategy.prototype.tokenParams = function () {
  console.log('🚨 DEBUG: Sending token exchange with redirect_uri =', this._callbackURL);
  return {};
};

passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`,
    passReqToCallback: true,
  },
  async (req, accessToken, refreshToken, profile, done) => {
    try {
      console.log('✅ Google OAuth Callback');
      console.log('Access Token:', accessToken);
      console.log('Profile:', JSON.stringify(profile, null, 2));

      const profileImage = profile?.photos?.[0]?.value || '';
      const email = profile?.emails?.[0]?.value;

      // Check if user exists
      let user = await User.findOne({ googleId: profile.id });

      if (user) {
        // Update profile image if changed
        if (profileImage && profileImage !== user.googleProfileImage) {
          user.googleProfileImage = profileImage;
          await user.save();
          console.log('🔄 Updated user profile image');
        }
        console.log('🔎 Existing user:', user.email);
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
      console.log('🆕 New user created:', user.email);
      return done(null, user);
    } catch (err) {
      console.error('❌ Passport Google OAuth error:', err);
      return done(err, null);
    }
  }
));

// Serialize user to store in session
passport.serializeUser((user, done) => {
  console.log('🔐 Serializing user:', user.id);
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    console.log('🔓 Deserialized user:', user?.email || 'Not found');
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
