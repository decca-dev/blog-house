const router = require("express").Router();
const User = require("../models/User");
const Log = require("../models/Log");
const functions = require("../misc/functions");
const fs = require('fs');
const marked = require('marked');
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const dompurify = createDOMPurify(new JSDOM().window);
const path = require('path')

router.get("/", async (req, res) => {
  const modLogs = await Log.find({ category: "Moderation" }).sort({
    at: "desc",
  });
  const postLogs = await Log.find({ category: "Post" }).sort({ at: "desc" });
  const userLogs = await Log.find({ category: "User" }).sort({ at: "desc" });

  let modData = [],
    postData = [],
    userData = [];

  for (let i = 0; i < modLogs.length; i++) {
    modData.push({
      category: "Moderation",
      actionType: modLogs[i].actionType,
      by: await functions.findUser(modLogs[i].by),
      onUser: await functions.findUser(modLogs[i].onUser),
      reason: modLogs[i].reason,
      id: modLogs[i]._id,
    });
  }

  for (let i = 0; i < postLogs.length; i++) {
    postData.push({
      category: "Post",
      actionType: postLogs[i].actionType,
      by: await functions.findUser(postLogs[i].by),
      reason: postLogs[i].reason,
      id: postLogs[i]._id,
    });
  }

  for (let i = 0; i < userLogs.length; i++) {
    userData.push({
      category: "User",
      actionType: userLogs[i].actionType,
      by: await functions.findUser(userLogs[i].by),
      onUser: await functions.findUser(userLogs[i].onUser),
      id: userLogs[i]._id,
    });
  }
  
  const pathy = path.join(__dirname, '..', 'utils', 'changelog.json');

  let rawData = fs.readFileSync(pathy);
  let data = JSON.parse(rawData);

  res.render("admin/index", {
    heading: "Admin Panel",
    mod: modData,
    post: postData,
    userD: userData,
    data: data,
    title: "BlogHouse",
    description:
      "Enjoy the best blogging experience!\nCreate an account or checkout blogs by others.",
    route: "/admin",
  });
});

router.delete("/logs/delete/:id", async (req, res) => {
  const log = await Log.findOneAndDelete({ _id: req.params.id });
  res.redirect("/admin");
});

router.post('/changelog/new', async (req, res) => {
  const { title, description, markdown } = req.body;
  const sanitized = dompurify.sanitize(marked(markdown))
  const data = {
    title: title,
    description: description,
    markdown: markdown,
    sanitizedHTML:sanitized,
    author: req.user.name,
    avatar: req.user.avatar,
    date: new Date()
  }
  const DATA = JSON.stringify(data, null, 2)
  const pathy = path.join(__dirname, '..', 'utils', 'changelog.json');
  fs.writeFileSync(pathy, DATA);
  res.redirect('/admin')
})

router.post("/ban/:uid", async (req, res) => {
  const user = await User.findOne({ uid: req.params.uid });
  const { reason } = req.body;

  if (user == null) return res.redirect("/404");

  if (user.isBanned == true) {
    req.flash('error_msg', `${user.name} is already banned.`)
    res.redirect(`/users/${user.slug}`);
    return;
  }

  user.isBanned = true;

  user.bannedAt = new Date();

  req.flash('success_msg', `Successfully banned ${user.name}.`)

  await user.save();

  await functions.log("Moderation", "User Ban", req.user.uid, user.uid, reason);

  res.redirect(`/users/${user.slug}`);
});

router.put("/unban/:uid", async (req, res) => {
  const user = await User.findOne({ uid: req.params.uid });
  const { reason } = req.body;

  if (user == null) return res.redirect("/404");

  if (user.isBanned == false) {
    req.flash('error_msg', `${user.name} is not banned.`)
    res.redirect(`/users/${user.slug}`);
  }

  user.isBanned = false;

  req.flash('success_msg', `Successfully unbanned ${user.name}.`)

  await user.save();

  await functions.log(
    "Moderation",
    "User Unban",
    req.user.uid,
    user.uid,
    reason
  );

  res.redirect(`/users/${user.slug}`);
});

module.exports = router;
