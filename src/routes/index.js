const router = require('express').Router();
const { ensureAuthenticated } = require('../misc/auth')

router.get('/', (req, res) => {
    res.render('index', { title: "BlogHouse", description: "Enjoy the best blogging experience!\nCreate an account or checkout blogs by others.", route: ""})
})

router.get('/form', (req, res) => {
    res.render('home', { title: "BlogHouse", description: "Get started with BlogHouse.\nCreate an account or login.", route: "/form"})
})

router.get('/dashboard', ensureAuthenticated, (req, res) => {
    res.render('dashboard', { user: req.user, title: "BlogHouse", description: "Enjoy the best blogging experience!\nCreate an account or checkout blogs by others.", route: "/dashboard" })
})

module.exports = router;