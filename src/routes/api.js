const router = require('express').Router();
const User = require('../models/User');
const Post = require('../models/Post');
const functions = require('../misc/functions');
const { validateApiKey } = require('../misc/check')

router.get('/', (req, res) => {
    res.render('api/index', {
        heading: 'API',
        title: 'BlogHouse API',
        description: "Checkout our API for developers!",
        route: "/api"
    })
})

router.get('/users', validateApiKey, async (req, res) => {
    const users = await User.find()
    let data = [];
    for (let i = 0; i < users.length; i++) {
        let payload = {
            uid: users[i].uid,
            name: users[i].name,
            slug: users[i].slug,
            avatar: users[i].avatar,
            bio: users[i].bio,
            isBanned: users[i].isBanned,
            isAdmin: users[i].isAdmin,
            followers: users[i].followers,
            following: users[i].following,
            posRep: users[i].posRep,
            negRep: users[i].negRep,
            registeredAt: users[i].registeredAt
        }
        data.push(payload)
    }
    res.status(200).send(data)
})

router.get('/users/:slug', validateApiKey, async (req, res) => {
    const user = await User.findOne({ slug: req.params.slug });
    if (user == null) return res.status(404).json({
        error: true,
        message: "user not found"
    })
    const data = {
        uid: user.uid,
        name: user.name,
        slug: user.slug,
        avatar: user.avatar,
        bio: user.bio,
        isBanned: user.isBanned,
        isAdmin: user.isAdmin,
        followers: user.followers,
        following: user.following,
        posRep: user.posRep,
        negRep: user.negRep,
        registeredAt: user.registeredAt
    }
    res.status(200).send(data)
})

router.get('/users/:slug/posts', validateApiKey, async (req, res) => {
    const user = await User.findOne({ slug: req.params.slug });
    if (user == null) return res.status(404).json({
        error: true,
        message: "user not found"
    })
    const posts = await Post.find({ author: user.uid }).sort({ createdAt: "desc" });

    let data = [];

    if (posts.length > 0) {
        for (let i = 0; i < posts.length; i++) {
            let payload = {
                title: posts[i].title,
                description: posts[i].description,
                markdown: posts[i].markdown,
                sanitizedHTML: posts[i].sanitizedHTML,
                slug: posts[i].slug,
                author: posts[i].author,
                views: posts[i].views,
                seenBy: posts[i].seenBy
            }
            data.push(payload)
        }
    }

    res.status(200).send(data)
})

router.get('/posts', validateApiKey, async (req, res) => {
    const posts =  await Post.find().sort({ createdAt: "desc" })

    let data = [];

    
    if (posts.length > 0) {
        for (let i = 0; i < posts.length; i++) {
            let payload = {
                title: posts[i].title,
                description: posts[i].description,
                markdown: posts[i].markdown,
                sanitizedHTML: posts[i].sanitizedHTML,
                slug: posts[i].slug,
                author: posts[i].author,
                views: posts[i].views,
                seenBy: posts[i].seenBy
            }
            data.push(payload)
        }
    }

    res.status(200).send(data)
})

router.get('/posts/:slug', validateApiKey, async (req, res) => {
    const post = await Post.findOne({ slug: req.params.slug });
    if (post == null) return res.status(404).json({
        error: true,
        message: "post not found"
    })

    const data = {
        title: post.title,
        description: post.description,
        markdown: post.markdown,
        sanitizedHTML: post.sanitizedHTML,
        slug: post.slug,
        author: post.author,
        views: post.views,
        seenBy: post.seenBy
    }

    res.status(200).send(data)
})

module.exports = router;