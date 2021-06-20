const router = require("express").Router();
const Post = require("../models/Post");
const User = require("../models/User");
const { ensureAuthenticated } = require("../misc/auth");
const baseUrl = process.env.URL;
const functions = require("../misc/functions");

router.get("/", async (req, res) => {
  const articles = await Post.find().sort({ createdAt: "desc" });
  const randomPost = articles[Math.floor(Math.random() * articles.length)];
  
  res.render("articles/index", {
    heading: "Articles | BlogHouse",
    articles: articles,
    random: randomPost,
    title: "Articles",
    description: "Checkout some of the coolest articles people made!",
    route: "/articles",
  });
});

router.get("/new", ensureAuthenticated, (req, res) => {
  res.render("articles/new", {
    heading: "New Article",
    article: new Post(),
    title: "Articles",
    description: "Create an article on BlogHouse",
    route: "/articles/new",
  });
});

router.get("/edit/:id", ensureAuthenticated, async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (req.user.uid !== post.author) return res.redirect("/403");

  res.render("articles/edit", {
    heading: "Edit Article",
    article: post,
    title: "Articles",
    description: "Edit an article",
    route: `/articles/edit/${post.id}`,
  });
});

router.post(
  "/new",
  ensureAuthenticated,
  async (req, res, next) => {
    req.post = new Post();
    next();
  },
  saveArticleAndRedirect("new")
);

router.put(
  "/:id",
  ensureAuthenticated,
  async (req, res, next) => {
    req.post = await Post.findById(req.params.id);
    next();
  },
  saveArticleAndRedirect("edit")
);

router.delete("/:id", ensureAuthenticated, async (req, res) => {
  await Post.findByIdAndDelete(req.params.id);
  res.redirect("/articles");
});

router.get("/:slug", async (req, res) => {
  const post = await Post.findOne({ slug: req.params.slug });
  if (post == null) res.redirect("/404");
  post.views += 1;
  if (req.user) {
    if (!post.seenBy.includes(req.user.uid)) {
      post.seenBy.push(req.user.uid);
    }
  }
  await post.save();
  const user = await User.findOne({ uid: post.author });
  let author;
  if (user) author = user.name;
  else author = "Deleted User";
  let data = [];
  for (let i = 0; i < post.seenBy.length; i++) {
    data.push(await functions.findUser(post.seenBy[i]));
  }
  res.render("articles/show", {
    heading: post.title,
    article: post,
    data: data,
    author: author,
    link: `${baseUrl}/articles/${req.params.slug}`,
    title: post.title,
    description: `${post.description.substr(0, 50)}...`,
    route: `/articles/${post.slug}`,
  });
});

function saveArticleAndRedirect(path) {
  return async (req, res) => {
    let post = req.post;

    const { title, description, markdown } = req.body;

    post.title = title;
    post.description = description;
    post.markdown = markdown;
    post.author = req.user.uid;

    await functions.log(
      "Post",
      `Post ${path.charAt(0).toUpperCase()}${path.substring(1, path.length)}`,
      req.user.uid,
      "",
      title
    );

    try {
      post = await post.save();
      res.redirect(`/articles/${post.slug}`);
    } catch (err) {
      console.log(err);
      res.render(`articles/${path}`, {
        article: post,
        title: "BlogHouse",
        description:
          "Enjoy the best blogging experience!\nCreate an account or checkout blogs by others.",
        route: "",
      });
    }
  };
}

module.exports = router;
