const router = require('express').Router();
const Post = require('../models/Post');
const { ensureAuthenticated } = require('../misc/auth')

router.get('/', async (req, res) => {
    const articles = await Post.find().sort({ createdAt: "desc" })
    res.render('articles/index', { articles: articles })
})

router.get('/new', ensureAuthenticated, (req, res) => {
    res.render('articles/new', { article: new Post() })
});

router.get('/edit/:id', ensureAuthenticated, async (req, res) => {
    const post = await Post.findById(req.params.id)
    res.render('articles/edit', { article: post })
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
    if (post == null) res.redirect('/articles')
    res.render('articles/show', { article: post })
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
            res.render(`articles/${path}`, { article: post })
        }
    }
}

module.exports = router;