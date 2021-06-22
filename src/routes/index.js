const router = require("express").Router();
const User = require("../models/User");
const Post = require("../models/Post");
const fetch = require("node-fetch");
const functions = require('../misc/functions');

router.get("/", async (req, res) => {
  const { search } = req.query;

  if (search) {
    const regex = new RegExp(escapeRegex(search), "gi");
    const users = await User.find({ name: regex });
    const posts = await Post.find({ title: regex });

    res.render("results", {
      heading: "Results | BlogHouse",
      query: search,
      users: users,
      posts: posts,
      title: "BlogHouse",
      description:
        "Enjoy the best blogging experience!\nCreate an account or checkout blogs by others.",
      route: "",
    });
  } else {
    res.render("index", {
      heading: "Home | BlogHouse",
      title: "BlogHouse",
      description:
        "Enjoy the best blogging experience!\nCreate an account or checkout blogs by others.",
      route: "",
    });
  }
});

router.get("/form", (req, res) => {
  res.render("home", {
    heading: "BlogHouse",
    title: "BlogHouse",
    description: "Get started with BlogHouse.\nCreate an account or login.",
    route: "/form",
  });
});

router.get('/contributors', async (req, res) => {
  let Data = [];
  await fetch('https://api.github.com/repos/decca-dev/blog-house/contributors')
  .then (res => res.json())
  .then(data => Data = data)
  res.render('contributors', {
    heading: "Contributors",
    title: "The BlogHouse contributors",
    description: "Checkout the amazing contributors behind BlogHouse",
    route: "/contributors",
    data: Data
  })
})

router.get('/about', async (req, res) => {
  let Data = [];
  await fetch('https://api.github.com/repos/decca-dev/blog-house/contributors')
  .then (res => res.json())
  .then(data => Data = data)
  res.render('about', {
    heading: "About",
    title: "About",
    description: "About BlogHouse",
    route: "/about",
    data: Data
  })
})

router.get('/leaderboard', async (req, res) => {

  const rep = await User.find().sort({ posRep: 'desc' });
  const posts = await Post.find().sort({ views: 'desc' });
  let authors = [];
  for (let i = 0; i < posts.length; i++) {
    let data = await functions.findUser(posts[i].author)
    authors.push({name: data.name, slug: data.slug})
  }
  const ranks = [
    "👑", // 1
    "2️⃣", // 2
    "3️⃣", // 3
    "4️⃣", // 4
    "5️⃣", // 5
    "6️⃣", // 6
    "7️⃣", // 7
    "8️⃣", // 8
    "9️⃣", // 9
    "🔟", // 10
  ]

  res.render('leaderboard', {
    heading: 'Leaderboard',
    title: 'Leaderboard',
    description: 'Checkout the leading users and posts in BlogHouse!',
    route: "/leaderboard",
    rep: rep,
    posts: posts,
    ranks: ranks,
    authors: authors
  })
})

router.get("/404", (req, res) => {
  res.render("errors/404.ejs", {
    heading: "Not Found",
    title: "BlogHouse",
    description:
      "Enjoy the best blogging experience!\nCreate an account or checkout blogs by others.",
    route: "",
  });
});

router.get("/401", (req, res) => {
  res.render("errors/401.ejs", {
    heading: "Unauthorized",
    title: "BlogHouse",
    description:
      "Enjoy the best blogging experience!\nCreate an account or checkout blogs by others.",
    route: "",
  });
});

router.get("/403", (req, res) => {
  res.render("errors/403.ejs", {
    heading: "Forbidden",
    title: "BlogHouse",
    description:
      "Enjoy the best blogging experience!\nCreate an account or checkout blogs by others.",
    route: "",
  });
});

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

module.exports = router;
