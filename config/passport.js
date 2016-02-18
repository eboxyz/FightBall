var User = require('../models/user');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var LocalStrategy = require('passport-local').Strategy;
require('dotenv').config({path: '../.env'})

module.exports = function(passport){
  passport.serializeUser(function (user, done){
    done(null, user.id);
  });

  passport.deserializeUser(function (obj, done){
    done(null, obj);
  });

  //local authentication for site
  passport.use('local-signup', new LocalStrategy({
    username: 'username',
    passwordField: 'password',
    passReqToCallback: true
  },
    function (req, username, password, done){
      process.nextTick(function(){
        User.findOne({
          'local.username': username
        }, function (err, user){
          if(err) return done(err);

          if(user){
            return done(null, false);
          } else{
            console.log(req.body);
            var newUser = new User();
            newUser.local.username = req.body.username;
            newUser.local.password = newUser.generateHash(password);
            newUser.save( function(err){
              console.log('new user created')
              if(err) throw err;
              return done(null, newUser);
            });
          }
        })
      })
    }
  ));

  passport.use('local-login', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
  }, function(req, username, password, done){
    User.findOne({
      'local.username': username
    }, function(err, user){
    if(err) return done(err);
    if(!user)
      return done(null, false)
    if(!user.validPass(password))
      return done(null, false)
    return done(null, user);
    });
    }
  ));

  passport.use('facebook', new FacebookStrategy({
    clientID        : process.env.FACEBOOK_APP_ID,
    clientSecret    : process.env.FACEBOOK_API_SECRET,
    // callbackURL     : 'http://fightball.herokuapp.com/auth/facebook/callback',
    callbackURL     : 'http://localhost:3000/auth/facebook/callback',
    enableProof     : true,
    profileFields   : ['name', 'emails']
  }, function(access_token, refresh_token, profile, done) {
    // // Use this to see the information returned from Facebook
    // console.log(profile)
    process.nextTick(function() {
      User.findOne({ 'fb.id' : profile.id }, function(err, user) {
        if (err) return done(err);
        if (user) {
          return done(null, user);
        } else {
          var newUser = new User();
          console.log(newUser)
          newUser.fb.id           = profile.id;
          newUser.fb.access_token = access_token;
          newUser.fb.firstName    = profile.name.givenName;
          newUser.fb.lastName     = profile.name.familyName;
          newUser.fb.email        = profile.emails[0].value;

          newUser.save(function(err) {
            if (err)
              throw err;
            return done(null, newUser);
          });
        }
      });
    });
  }));

}
