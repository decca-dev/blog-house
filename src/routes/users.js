const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const genID = require('../misc/genID');

router.get('/login', async (req, res) => {
    res.render('login', { title: "BlogHouse", description: "Login with BlogHouse", route: "/users/login"})
})

router.get('/register', async (req, res) => {
    res.render('register', { title: "BlogHouse", description: "Register an account with BlogHouse", route: "/users/register"});
});

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

    const existingName = await User.findOne({ name: name });

    if (existingName) {
        errors.push({msg: "That name is already taken!\n"})
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
                    password,
                    id: genID()
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
        successRedirect: '/',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next)
})

//*Logout
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You have logged out!');
    res.redirect('/')
})

router.get('/:slug', async (req, res) => {
    const user = await User.findOne({ slug: req.params.slug })
    if (user == null) res.redirect('/')
    res.render('users/profile', { user: user, title: user.name, description: user.bio, route: `/users/${user.slug}` })
})

module.exports = router;