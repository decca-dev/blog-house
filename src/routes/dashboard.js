const router = require('express').Router();
const { ensureAuthenticated } = require('../misc/auth')
const User = require('../models/User');
const slugify = require('slugify');

router.get('/', (req, res) => {
    res.render('users/dashboard', { user: req.user, title: "BlogHouse", description: "Enjoy the best blogging experience!\nCreate an account or checkout blogs by others.", route: "/" })
})

router.get('/settings', (req, res) => {
    res.render('users/settings', { user: req.user, title: "BlogHouse", description: "Enjoy the best blogging experience!\nCreate an account or checkout blogs by others.", route: "//settings" })
})

router.put('/settings/name', async (req, res) => {
    const user = await User.findOne({ uid: req.user.uid });

    const { name } = req.body;

    user.name = name;
    
    user.slug = slugify(name, { lower: true, strict: true })

    await user.save();

    res.redirect('/dashboard')
})

router.put('/settings/bio', async (req, res) => {
    const user = await User.findOne({ uid: req.user.uid });

    const { bio } = req.body;

    user.bio = bio;

    await user.save();

    res.redirect('/dashboard')
})

router.put('/settings/avatar', async (req, res) => {
    const user = await User.findOne({ uid: req.user.uid });

    const { avatar } = req.body;

    user.avatar = avatar;

    await user.save();

    res.redirect('/dashboard');
})

router.delete('/settings/delete', async (req, res) => {
    await User.findOneAndDelete({ uid: req.user.uid })
    res.redirect('/')
})

module.exports = router;