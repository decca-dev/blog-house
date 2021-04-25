const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

module.exports = (passport) => {
    passport.use(
        new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
            //*Match user
            User.findOne({ email: email })
            .then(user => {
                if (!user) {
                    return done(null, false, { message: 'Email not registered' });
                }

                //*Match password
                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if (err) throw err;

                    if (isMatch) {
                        return done(null, user)
                    }else {
                        return done(null, false, { message: 'Password incorrect' })
                    }
                })
            })
            .catch(err => console.log(err))
        })
    )

    passport.serializeUser((user, done) => {
        done(null, user)
    })

    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            done(err, user)
        })
    })
}