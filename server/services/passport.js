const keys = require('../config/keys');
const passport = require("passport");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const mongoose = require("mongoose");
const User = mongoose.model('users');

// serialize and deserialize is to utilize cookie so that website can handle revisited users
passport.serializeUser((user, done) => {
    // this is not a profile id. user.id is a id generated by mongo
    done(null, user.id);
});

passport.deserializeUser((id,done) => {
    User.findById(id).then(user => {
        done(null, user);
    });
});

passport.use(
    new GoogleStrategy(
    {
        clientID : keys.googleAuth.clientID,
        clientSecret : keys.googleAuth.clientSecret,
        callbackURL : keys.googleAuth.callbackURL
       
    }, 
    async (accessToken,refreshToken, profile, done) => {
 
            const existingUser = await User.findOne({ googleId: profile.id});
    
            if (existingUser) {
               return done(null, existingUser);
             }
            const user = await new User({  googleId: profile.id}).save();
            done(null,user);
        }
));

passport.use(new FacebookStrategy({
        clientID: keys.facebookAuth.clientID,
        clientSecret: keys.facebookAuth.clientSecret,
        callbackURL: keys.facebookAuth.callbackURL,
        profileFields: ['id', 'email','displayName']
    },
    async (accessToken, refreshToken, profile, cb) => {
    const existingUser = await User.findOne({ facebookId: profile.id })
    if (existingUser) {
      return cb(null, existingUser);
    }
    const user =  await new User({ facebookId: profile.id }).save();
    console.log('facebookeuser', user)
    cb(null, user);
    }
));
