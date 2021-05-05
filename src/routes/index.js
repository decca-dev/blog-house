const router = require('express').Router();
const User = require('../models/User');
const Post = require('../models/Post');

router.get('/', async (req, res) => {

    const { search } = req.query;

    if (search) {
        const regex = new RegExp(escapeRegex(search), 'gi');
        const users = await User.find({name: regex});
        const posts = await Post.find({title: regex});

        res.render('results', { query: search, users: users, posts: posts, title: "BlogHouse", description: "Enjoy the best blogging experience!\nCreate an account or checkout blogs by others.", route: ""})
    }else {
        res.render('index', { title: "BlogHouse", description: "Enjoy the best blogging experience!\nCreate an account or checkout blogs by others.", route: ""})
    }

})

router.get('/form', (req, res) => {
    res.render('home', { title: "BlogHouse", description: "Get started with BlogHouse.\nCreate an account or login.", route: "/form"})
})

router.get('/404', (req, res) => {
    res.render('errors/404.ejs', { title: "BlogHouse", description: "Enjoy the best blogging experience!\nCreate an account or checkout blogs by others.", route: ""})
})

router.get('/401', (req, res) => {
    res.render('errors/401.ejs', { title: "BlogHouse", description: "Enjoy the best blogging experience!\nCreate an account or checkout blogs by others.", route: ""})
})

router.get('/403', (req, res) => {
    res.render('errors/403.ejs', { title: "BlogHouse", description: "Enjoy the best blogging experience!\nCreate an account or checkout blogs by others.", route: ""})
})

function escapeRegex(text){
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

module.exports = router;