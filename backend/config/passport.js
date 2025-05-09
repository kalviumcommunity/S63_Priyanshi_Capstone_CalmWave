const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback",
}, async (accessToken, refreshToken, profile, done) => {
  try {
    console.log('Google profile:', JSON.stringify(profile, null, 2));
    
    // Get profile image if available
    let profileImage = '';
    if (profile.photos && profile.photos.length > 0) {
      profileImage = profile.photos[0].value;
    }
    
    const existingUser = await User.findOne({ googleId: profile.id });
    if (existingUser) {
      // Update profile image if it has changed
      if (profileImage && profileImage !== existingUser.googleProfileImage) {
        existingUser.googleProfileImage = profileImage;
        await existingUser.save();
      }
      return done(null, existingUser);
    }

    const newUser = new User({
      fullName: profile.displayName,
      email: profile.emails[0].value,
      googleId: profile.id,
      googleProfileImage: profileImage
    });

    await newUser.save();
    done(null, newUser);
  } catch (err) {
    console.error('Passport error:', err);
    done(err, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser((id, done) => {
  User.findById(id).then(user => done(null, user));
});
