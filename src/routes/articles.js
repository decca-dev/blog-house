const router = require('express').Router();
const Post = require('../models/Post');
const User = require('../models/User');
const { ensureAuthenticated } = require('../misc/auth')

router.get('/', async (req, res) => {
    const articles = await Post.find().sort({ createdAt: "desc" })
    res.render('articles/index', { articles: articles, title: "Articles", description: "Checkout some of the coolest articles people made!", route: "/articles" })
})

router.get('/new', ensureAuthenticated, (req, res) => {
    res.render('articles/new', { article: new Post(), title: "Articles", description: "Create an article on BlogHouse", route: "/articles/new"})
});

router.get('/edit/:id', ensureAuthenticated, async (req, res) => {
    const post = await Post.findById(req.params.id)

    if (req.user.name !== post.author) return res.redirect('/403')

    res.render('articles/edit', { article: post, title: "Articles", description: "Edit an article", route: `/articles/edit/${post.id}` })
});

router.post('/new', ensureAuthenticated, async (req, res, next) => {
    req.post = new Post()

    next()
}, saveArticleAndRedirect('new'))

router.put('/:id', ensureAuthenticated, async (req, res, next) => {
    req.post = await Post.findById(req.params.id)
    next()
}, saveArticleAndRedirect('edit'))

router.delete('/:id', ensureAuthenticated, async (req, res) => {
    await Post.findByIdAndDelete(req.params.id)
    res.redirect('/articles')
})

router.get('/:slug', async (req, res) => {
    const post = await Post.findOne({ slug: req.params.slug })
    if (post == null) res.redirect('/404')
    res.render('articles/show', { article: post, title: post.title, description: `${post.description.substr(0, 50)}...`, route: `/articles/${post.slug}`})
})

function saveArticleAndRedirect(path){
    return async (req, res) => {

        let post = req.post

        const { title, description, markdown } = req.body;

        post.title = title
        post.description = description
        post.markdown = markdown
        post.author = req.user.name

        try {
            post = await post.save()
            res.redirect(`/articles/${post.slug}`)
        } catch (err) {
            console.log(err)
            res.render(`articles/${path}`, { article: post, title: "BlogHouse", description: "Enjoy the best blogging experience!\nCreate an account or checkout blogs by others.", route: "" })
        }
    }
}

module.exports = router;