const LocalStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const GithubStrategy = require('passport-github').Strategy;
const DiscordStrategy = require('passport-discord').Strategy;

module.exports.local = (passport) => {
  passport.use(
    new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
      //*Match user
      User.findOne({ email: email })
        .then((user) => {
          if (!user) {
            return done(null, false, { message: "Email not registered" });
          }

          //*Match password
          bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) throw err;

            if (isMatch) {
              return done(null, user);
            } else {
              return done(null, false, { message: "Password incorrect" });
            }
          });
        })
        .catch((err) => console.log(err));
    })
  );

  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });
};

module.exports.github = (passport) => {
  passport.use(new GithubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.URL + "/users/auth/github/callback"
  }, function(accessToken, refreshToken, profile, cb) {
      User.findOne({ uid: profile.id })
      .then((user) => {
        if (!user) {
          User.create({
            name: profile.username + '-gh',
            uid: profile.id,
            avatar: profile._json.avatar_url,
            bio: profile._json.bio
          })
          .then((newUser) => {
            return cb(null, newUser)
          })
        }else {
          return cb(null, user)
        }
      })
  }))
}

module.exports.discord = (passport) => {
  const scope = 'identify';
  passport.use(new DiscordStrategy({
    clientID: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    callbackURL: process.env.URL + "/users/auth/discord/callback",
    scope: scope
  }, function (accessToken, refreshToken, profile, cb) {
    User.findOne({ uid: profile.id })
    .then((user) => {
      if (!user) {
        User.create({
          name: profile.username + '-dc',
          uid: profile.id,
          avatar: `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`,
        })
        .then((newUser) => {
          return cb(null, newUser)
        })
      }else {
        return cb(null, user)
      }
    })
  }))
}