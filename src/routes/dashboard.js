const router = require('express').Router();
const { ensureAuthenticated } = require('../misc/auth')
const User = require('../models/User');
const slugify = require('slugify');

router.get('/', (req, res) => {
    res.render('users/dashboard', { heading: "Dashboard",  user: req.user, title: "BlogHouse", description: "Enjoy the best blogging experience!\nCreate an account or checkout blogs by others.", route: "/" })
})

router.get('/settings', (req, res) => {
    res.render('users/settings', { heading: "Settings", user: req.user, title: "BlogHouse", description: "Enjoy the best blogging experience!\nCreate an account or checkout blogs by others.", route: "//settings" })
})

router.put('/settings/name', async (req, res) => {
    const user = await User.findOne({ uid: req.user.uid });

    const { name } = req.body;

    user.name = name;

    await user.save();

    req.flash('success_msg', 'Name changed successfully!');

    res.redirect('/dashboard/settings')
})

router.put('/settings/bio', async (req, res) => {
    const user = await User.findOne({ uid: req.user.uid });

    const { bio } = req.body;

    user.bio = bio;

    await user.save();

    req.flash('success_msg', 'Bio changed successfully!');

    res.redirect('/dashboard/settings')
})

router.put('/settings/avatar', async (req, res) => {
    const user = await User.findOne({ uid: req.user.uid });

    const { avatar } = req.body;

    user.avatar = avatar;

    await user.save();

    req.flash('success_msg', 'Avatar changed successfully!');

    res.redirect('/dashboard/settings')
})

router.delete('/settings/delete', async (req, res) => {
    await User.findOneAndDelete({ uid: req.user.uid })
    res.redirect('/')
})

module.exports = router;