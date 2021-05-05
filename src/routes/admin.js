const router = require('express').Router();
const User = require('../models/User');
const Log = require('../models/Log');

router.get('/', async (req, res) => {
    const logs = await Log.find().sort({ at: "desc" });
    const banned = await User.find({ isBanned: true });
    const admins = await User.find({ isAdmin: true });
    res.render('admin/index', { logs: logs, banned: banned, admins: admins, title: "BlogHouse", description: "Enjoy the best blogging experience!\nCreate an account or checkout blogs by others.", route: ""});
})

router.post('/ban/:uid', async (req, res) => {
    const user = await User.findOne({ uid: req.params.uid });
    const { reason } = req.body;

    if (user == null) return res.redirect('/404');

    if (user.isBanned == true) return res.redirect(`/users/${user.slug}`)

    user.isBanned = true;

    await user.save();

    const log = new Log({
        actionType: 'User Ban',
        by: `${req.user.uid}`,
        onUser: `${user.uid}`,
        reason
    })

    await log.save();

    res.redirect(`/users/${user.slug}`)
})

router.put('/unban/:uid', async (req, res) => {
    const user = await User.findOne({ uid: req.params.uid });
    const { reason } = req.body;

    if (user == null) return res.redirect('/404');

    if (user.isBanned == false) return res.redirect(`/users/${user.slug}`)

    user.isBanned = false;

    await user.save();

    const log = new Log({
        actionType: 'User Unban',
        by: `${req.user.uid}`,
        onUser: `${user.uid}`,
        reason
    })

    await log.save();

    res.redirect(`/users/${user.slug}`)
})

module.exports = router;