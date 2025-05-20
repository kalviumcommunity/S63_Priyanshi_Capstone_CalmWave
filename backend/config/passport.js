const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const OAuth2Strategy = require('passport-google-oauth20').Strategy; // For prototype override
const User = require('../models/User');

// Override tokenParams to add debug log
OAuth2Strategy.prototype.tokenParams = function (options) {
  console.log('🚨 DEBUG: Sending token exchange request with redirect_uri =', this._callbackURL);
  return {};
};

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: `${process.env.BACKEND_URL}/auth/google/callback`,
  passReqToCallback: true,  // to access req in callback if needed
},
async (req, accessToken, refreshToken, profile, done) => {
  try {
    console.log('==== Google OAuth Callback ====');
    console.log('Access Token:', accessToken);
    console.log('Refresh Token:', refreshToken);
    console.log('Profile:', JSON.stringify(profile, null, 2));

    let profileImage = '';
    if (profile.photos && profile.photos.length > 0) {
      profileImage = profile.photos[0].value;
    }

    // Find user by googleId
    const existingUser = await User.findOne({ googleId: profile.id });
    if (existingUser) {
      // Update profile image if changed
      if (profileImage && profileImage !== existingUser.googleProfileImage) {
        existingUser.googleProfileImage = profileImage;
        await existingUser.save();
        console.log('Updated existing user profile image');
      }
      console.log('Existing user found:', existingUser.email);
      return done(null, existingUser);
    }

    // Create new user
    const newUser = new User({
      fullName: profile.displayName,
      email: profile.emails[0].value,
      googleId: profile.id,
      googleProfileImage: profileImage,
    });

    await newUser.save();
    console.log('New user created:', newUser.email);
    return done(null, newUser);
  } catch (err) {
    console.error('Passport Google OAuth error:', err);
    return done(err, null);
  }
}));

passport.serializeUser((user, done) => {
  console.log('Serializing user:', user.id);
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    console.log('Deserialized user:', user ? user.email : 'User not found');
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
