const User = require('../models/User');

module.exports.checkBanned = async (req, res, next) => {
  if (req.user) {
    if (req.user.isBanned) {
      res.render("errors/banned", {
        title: "BlogHouse",
        description:
          "Enjoy the best blogging experience!\nCreate an account or checkout blogs by others.",
        route: "",
      });
    } else {
      return next();
    }
  } else {
    return next();
  }
};

module.exports.checkAdmin = async (req, res, next) => {
  if (req.user) {
    if (req.user.isAdmin == false) {
      res.redirect("/403");
    } else {
      return next();
    }
  }
};

module.exports.validateApiKey = async (req, res, next) => {
  let keys = [];

  const users = await User.find();

  for (let i = 0; i < users.length; i++) {
    keys.push(users[i].apiKey)
  }

  const { authorization } = req.headers;

  if (authorization) {
    if (!keys.includes(authorization)) return res.status(401).json({
      error: true,
      message: "Unauthorized key"
    })
    next()
  }else {
    return res.status(401).json({
      error: true,
      message: "Missing api key"
    })
  }
}