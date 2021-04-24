const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const passport = require('passport');

router.get('/login', async (req, res) => {
    res.render('login')
})

router.get('/register', async (req, res) => {
    res.render('register');
})

router.post('/register', async (req, res) => {
    const { name, email, password, password2 } = req.body;
    let errors = [];

    //*Check required fields

    if (!name || !email || !password || !password2) {
        errors.push({msg: "Please fill in all the fields.\n"})
    }

    //*Check passwod match
    if (password !== password2) {
        errors.push({msg: "Passwords don't match.\n"})
    }

    //*Check password length
    if (password.length < 6) {
        errors.push({msg: "Password should be at least 6 characters.\n"})
    }

    if (errors.length > 0) {
        res.render('register', {
            errors,
            name,
            email,
            password,
            password2
        })
    }else {
        
        //*Validation
        User.findOne({ email: email })
        .then(async user => {
            if (user) {
                //!User with the same email
                errors.push({msg: "Email already registered!"})
                res.render('register', {
                    errors,
                    name,
                    email,
                    password,
                    password2
                });
            }else {
                const newData = new User({
                    name,
                    email,
                    password
                });

                //*Hash password
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newData.password, salt, (err, hash) => {
                        if (err) throw err;

                        //*Set password to hashed
                        newData.password = hash;
                        //*Save user
                        newData.save()
                        .then(user => {
                            req.flash('success_msg', "Registered Successfully! You can now log in")
                            res.redirect('/users/login')
                        })
                        .catch(err => console.error(err))
                    })
                })

            }
        })
    }
})

//*Login handle
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next)
})

//*Logout
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You have logged out!');
    res.redirect('/users/login')
})

module.exports = router;