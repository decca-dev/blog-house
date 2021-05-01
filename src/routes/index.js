const router = require('express').Router();

router.get('/', (req, res) => {
    res.render('index', { title: "BlogHouse", description: "Enjoy the best blogging experience!\nCreate an account or checkout blogs by others.", route: ""})
})

router.get('/form', (req, res) => {
    res.render('home', { title: "BlogHouse", description: "Get started with BlogHouse.\nCreate an account or login.", route: "/form"})
})

module.exports = router;