const router = require('express').Router();
const { ensureAuthenticated } = require('../misc/auth')

router.get('/', (req, res) => {
    res.render('index')
})

router.get('/form', (req, res) => {
    res.render('home')
})

router.get('/dashboard', ensureAuthenticated, (req, res) => {
    res.render('dashboard', { user: req.user })
})

module.exports = router;