const router = require("express").Router();
const { ensureAuthenticated } = require("../misc/auth");
const User = require("../models/User");
const slugify = require("slugify");
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

let timestamp = Math.round((new Date).getTime()/1000);

router.get("/", (req, res) => {

  res.render("users/dashboard", {
    heading: "Dashboard",
    user: req.user,
    title: "BlogHouse",
    description:
      "Enjoy the best blogging experience!\nCreate an account or checkout blogs by others.",
    route: "/dashboard",
  });
});

router.get("/settings", (req, res) => {

  let signature = cloudinary.utils.api_sign_request({
    timestamp: timestamp,
    eager: 'w_400,h_300,c_pad|w_260,h_200,c_crop',
    public_id: `${req.user.name}-avatar`
  }, process.env.CLOUDINARY_API_SECRET);

  res.render("users/settings", {
    heading: "Settings",
    user: req.user,
    title: "BlogHouse",
    description:
      "Enjoy the best blogging experience!\nCreate an account or checkout blogs by others.",
    route: "/dashboard/settings",
    timestamp: timestamp,
    signature: signature,
    apiKey: process.env.CLOUDINARY_API_KEY
  });
});

router.put("/settings/name", async (req, res) => {
  const user = await User.findOne({ uid: req.user.uid });

  const { name } = req.body;

  const dupe = await User.findOne({ name: name});

  if (dupe) {
    req.flash('error_msg', "That name is already taken!")
    res.redirect("/dashboard/settings");
    return;
  }else {
    user.name = name;

    await user.save();

    req.flash("success_msg", "Name changed successfully!");
    res.redirect("/dashboard/settings");
  } 
});

router.put("/settings/bio", async (req, res) => {
  const user = await User.findOne({ uid: req.user.uid });

  const { bio } = req.body;

  user.bio = bio;

  await user.save();

  req.flash("success_msg", "Bio changed successfully!");

  res.redirect("/dashboard/settings");
});

router.post("/settings/avatar", async (req, res) => {
  const user = await User.findOne({ uid: req.body.uid });

  const { avatar } = req.body

  user.avatar = avatar;

  await user.save();
});

router.delete("/settings/delete", async (req, res) => {
  await User.findOneAndDelete({ uid: req.user.uid });
  res.redirect("/");
});

module.exports = router;
