const router = require("express").Router();
const User = require("../models/User");
const Post = require("../models/Post");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const authControllers = require("../misc/authControllers");
const functions = require("../misc/functions");

router.get("/login", async (req, res) => {
  res.render("login", {
    heading: "Login | BlogHouse",
    title: "BlogHouse",
    description: "Login with BlogHouse",
    route: "/users/login",
  });
});

router.post("/login", authControllers.loginHandle);

router.get("/register", async (req, res) => {
  res.render("register", {
    heading: "Register | BlogHouse",
    title: "BlogHouse",
    description: "Register an account with BlogHouse",
    route: "/users/register",
  });
});

router.post("/register", authControllers.registerHandle);

router.get("/activate/:token", authControllers.activateHandle);

router.get("/forgot", (req, res) => {
  res.render("forgot", {
    heading: "Forgot Password",
    title: "BlogHouse",
    description: "Recover your password",
    route: "/users/forgot",
  });
});

router.post("/forgot", authControllers.forgotPassword);

router.get("/forgot/:token", authControllers.gotoReset);

router.get("/reset/:id", (req, res) => {
  res.render("reset", {
    heading: "Reset Password",
    id: req.params.id,
    title: "BlogHouse",
    description: "Reset your password",
    route: `/users/reset/${req.params.id}`,
  });
});

router.post("/reset/:id", authControllers.resetPassword);

router.get("/logout", authControllers.logoutHandle);

router.post("/follow/:userID/:toFollowID", async (req, res) => {
  const { userID, toFollowID } = req.params;

  functions.followUser(userID, toFollowID);

  const toFollowDude = await User.findOne({ uid: toFollowID });

  await functions.log(
    "User",
    "User Follow",
    req.user.uid,
    toFollowDude.uid,
    ""
  );

  req.flash("success_msg", `Started following ${toFollowDude.name}`);
  setTimeout(() => {
    res.redirect(`/users/${toFollowDude.slug}`);
  }, 1000);
});

router.post("/unfollow/:userID/:toUnfollowID", async (req, res) => {
  const { userID, toUnfollowID } = req.params;

  functions.unfollowUser(userID, toUnfollowID);

  const toFollowDude = await User.findOne({ uid: toUnfollowID });

  req.flash("success_msg", `Unfollowed ${toFollowDude.name}`);
  setTimeout(() => {
    res.redirect(`/users/${toFollowDude.slug}`);
  }, 1000);
});

router.post("/posrep/:userID/:toRepID", async (req, res) => {
  const { userID, toRepID } = req.params;

  functions.posRep(userID, toRepID, req);

  const dude = await User.findOne({ uid: toRepID });

  setTimeout(() => {
    res.redirect(`/users/${dude.slug}`);
  }, 1000);
});

router.post("/negrep/:userID/:toRepID", async (req, res) => {
  const { userID, toRepID } = req.params;

  functions.negRep(userID, toRepID, req);

  const dude = await User.findOne({ uid: toRepID });

  setTimeout(() => {
    res.redirect(`/users/${dude.slug}`);
  }, 1000);
});

router.get("/:slug/followers", async (req, res) => {
  const { slug } = req.params;

  const user = await User.findOne({ slug: slug });

  const followers = user.followers;

  let data = [];

  for (let i = 0; i < followers.length; i++) {
    data.push(await functions.findUser(followers[i]));
  }

  res.render("users/followers", {
    heading: "BlogHouse",
    dude: user,
    data: data,
    followers: followers,
    title: user.name,
    description: `Checkout ${user.name}'s followers`,
    route: `/users/${user.slug}/followers`,
  });
});

router.get("/:slug/following", async (req, res) => {
  const { slug } = req.params;

  const user = await User.findOne({ slug: slug });

  const following = user.following;

  let data = [];

  for (let i = 0; i < following.length; i++) {
    data.push(await functions.findUser(following[i]));
  }

  res.render("users/following", {
    heading: "BlogHouse",
    dude: user,
    data: data,
    following: following,
    title: user.name,
    description: `Checkout ${user.name}'s followings`,
    route: `/users/${user.slug}/following`,
  });
});

router.get("/:slug/stats", async (req, res) => {
  const { slug } = req.params;

  const user = await User.findOne({ slug: slug });
  const allDocs = await User.find();
  const posRepRank = await User.find()
    .limit(allDocs.length)
    .sort({ posRep: "desc" });
  const negRepRank = await User.find()
    .limit(allDocs.length)
    .sort({ negRep: "desc" });

  let reprank = {
    pos: null,
    neg: null,
  };

  for (let i = 0; i < posRepRank.length; i++) {
    if (user.uid === posRepRank[i].uid) {
      reprank.pos = i;
    }
  }

  for (let j = 0; j < negRepRank.length; j++) {
    if (user.uid === negRepRank[j].uid) {
      reprank.neg = j;
    }
  }

  res.render("users/stats", {
    heading: "Stats",
    dude: user,
    reprank: reprank,
    title: user.name,
    description: `Checkout ${user.name}'s stats`,
    route: `/users/${user.slug}/stats`,
  });
});

router.get("/:slug", async (req, res) => {
  const dude = await User.findOne({ slug: req.params.slug });
  if (dude == null) res.redirect("/404");
  const posts = await Post.find({ author: dude.uid });
  res.render("users/user", {
    heading: dude.name,
    dude: dude,
    articles: posts,
    title: dude.name,
    description: dude.bio,
    route: `/users/${dude.slug}`,
  });
});

//! Removed
// router.post('/register', async (req, res) => {
//     const { name, email, password, password2 } = req.body;
//     let errors = [];

//     //*Check required fields

//     if (!name || !email || !password || !password2) {
//         errors.push({msg: "Please fill in all the fields.\n"})
//     }

//     //*Check passwod match
//     if (password !== password2) {
//         errors.push({msg: "Passwords don't match.\n"})
//     }

//     //*Check password length
//     if (password.length < 6) {
//         errors.push({msg: "Password should be at least 6 characters.\n"})
//     }

//     const existingName = await User.findOne({ name: name });

//     if (existingName) {
//         errors.push({msg: "That name is already taken!\n"})
//     }

//     if (errors.length > 0) {
//         res.render('register', {
//             errors,
//             name,
//             email,
//             password,
//             password2
//         })
//     }else {

//         //*Validation
//         User.findOne({ email: email })
//         .then(async user => {
//             if (user) {
//                 //!User with the same email
//                 errors.push({msg: "Email already registered!"})
//                 res.render('register', {
//                     errors,
//                     name,
//                     email,
//                     password,
//                     password2
//                 });
//             }else {
//                 const newData = new User({
//                     name,
//                     email,
//                     password,
//                 });

//                 //*Hash password
//                 bcrypt.genSalt(10, (err, salt) => {
//                     bcrypt.hash(newData.password, salt, (err, hash) => {
//                         if (err) throw err;

//                         //*Set password to hashed
//                         newData.password = hash;
//                         //*Save user
//                         newData.save()
//                         .then(user => {
//                             req.flash('success_msg', "Registered Successfully! You can now log in")
//                             res.redirect('/users/login')
//                         })
//                         .catch(err => console.error(err))
//                     })
//                 })

//             }
//         })
//     }
// })

module.exports = router;
