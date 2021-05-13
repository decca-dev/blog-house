const router = require('express').Router();
const User = require('../models/User');
const Post = require('../models/Post');
const functions = require('../misc/functions');
const { verifyApiKey } = require('../misc/auth');

router.get('/', (req, res) => {
    res.send('API docs will be here soon!')
})

router.get('/users', async (req, res) => {
    const users = await User.find()
    res.status(200).send(users)
})

router.get('/users/:slug', async (req, res) => {
    const user = await User.findOne({ slug: req.params.slug });
    if (user == null) return res.status(404).json({
        error: true,
        message: "user not found"
    })
    res.status(200).send(user)
})

router.get('/users/:slug/posts', async (req, res) => {
    const user = await User.findOne({ slug: req.params.slug });
    if (user == null) return res.status(404).json({
        error: true,
        message: "user not found"
    })
    const posts = await Post.find({ author: user.uid });
    res.status(200).send(posts)
})

router.get('/posts', async (req, res) => {
    const posts =  await Post.find()
    res.status(200).send(posts)
})

router.get('/posts/:slug', async (req, res) => {
    const post = await Post.findOne({ slug: req.params.slug });
    if (post == null) return res.status(404).json({
        error: true,
        message: "post not found"
    })
    res.status(200).send(post)
})

module.exports = router;