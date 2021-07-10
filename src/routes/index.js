const router = require("express").Router();
const User = require("../models/User");
const Post = require("../models/Post");
const Log = require('../models/Log');
const fetch = require("node-fetch");
const functions = require('../misc/functions');
const { ensureAuthenticated } = require('../misc/auth')
const path = require('path'),
  fs = require('fs');

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

router.get('/feed', ensureAuthenticated, async (req, res) => {
  const logs = await Log.find().sort({ at: 'desc' });
  const followedUsers = req.user.following;
  let logged = [];

  for (let i = 0; i < logs.length; i++) {
    if (logs[i].category !== 'Moderation') {
      if (followedUsers.includes(logs[i].by)) {
        logged.push(logs[i])
      }
    }
  }

  let users = [];

  for (let i = 0; i < logged.length; i++) {
    const user = await functions.findUser(logged[i].by);
    users.push({name: user.name, avatar: user.avatar})
  }

  let users2 = [];

  for (let i = 0; i < logged.length; i++) {
    if (logged[i].actionType == "User Follow") {
      const user = await functions.findUser(logged[i].onUser);
      const by = await functions.findUser(logged[i].by);
      users2.push({Onname: user.name, Onavatar: user.avatar, at: logged[i].at, Byname: by.name, Byavatar: by.avatar})
    }
  }

  let data = [];
  let data2 = [];

  for (let i = 0; i < logged.length; i++) {
    let payload;
    if (logged[i].category === "Post") {
      payload = {
        at: logged[i].at,
        actionType: logged[i].actionType,
        category: logged[i].category,
        reason: logged[i].reason,
        by: {
          name: users[i].name,
          avatar: users[i].avatar
        }
      }
    }
    data.push(payload)
  }

  if (users2.length > 0) {
    for (let i = 0; i < users2.length; i++) {
      let payload = {
        at: users2[i].at,
        actionType: "User Follow",
        category: "User",
        by: {
          name: users2[i].Byname,
          avatar: users2[i].Byavatar
        },
        onUser: {
          name: users2[i].Onname,
          avatar: users2[i].Onavatar
        }
      }
      data2.push(payload)
    }
  }
  
  res.render('feed', {
    heading: "Your feed",
    title: 'Feed',
    description: 'Check your feed!',
    route: '/feed',
    data: data,
    data2: data2
  })
})

router.get('/changelog', async (req, res) => {

  let Data = [];
  await fetch('https://api.github.com/repos/decca-dev/blog-house/commits')
  .then (res => res.json())
  .then(data => Data = data)

  const pathy = path.join(__dirname, '..', 'utils', 'changelog.json');

  let rawData = fs.readFileSync(pathy);
  let cData = JSON.parse(rawData);

  res.render('changelog', {
    data: Data,
    cdata: cData,
    heading: "Changelog",
    title: "Changelog",
    description: "Checkout the recent changes to BlogHouse!",
    route: "/changelog",
  })
})

router.get('/login', (req, res) => {
  res.redirect('/users/login')
})

router.get('/register', (req, res) => {
  res.redirect('/users/register')
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
