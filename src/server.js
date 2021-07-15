//* Dependencies

require("dotenv").config();
const Logger = require("./utils/Logger");

Logger.info("Loading resources...", "server");
const livereload = require("livereload");
const connectLivereload = require("connect-livereload");
const http = require("http");
const express = require("express");
const app = express();
const server = http.createServer(app);
const expressLayouts = require("express-ejs-layouts");
const bodyParser = require("body-parser");
const path = require("path");
const mongoose = require("mongoose");
const flash = require("connect-flash");
const session = require("express-session");
const passport = require("passport");
const moment = require("moment");
const slugify = require("slugify");
const chalk = require("chalk")
const methodOverride = require("method-override");

//* Variables and functions
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const strategies = require('./misc/passport');
strategies.local(passport);
strategies.github(passport);
strategies.discord(passport);
const { ensureAuthenticated } = require("./misc/auth");
const { checkBanned } = require("./misc/check");
const { checkAdmin } = require("./misc/check");
const functions = require("./misc/functions");
const publicDirectory = path.join(__dirname, "public");

//*Development
// const livereloadServer = livereload.createServer();
// livereloadServer.watch(publicDirectory);
// app.use(connectLivereload());

//*Database
Logger.info("Connecting to MongoDB...", "Database");

mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => {
    Logger.info("Successfully connected to MongoDB", "database");
  })
  .catch((err) => {
    console.log(
      chalk.red(`There was an error trying to connect to Mongo\n${err}`)
    );
  });

//*Middlware

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())
app.use(methodOverride("_method"));

app.use(expressLayouts);

//*Views
app.set("views", path.join(__dirname, "/views"));
app.set("view engine", "ejs");

app.use("/public", express.static(publicDirectory));

//*Sessions
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
    cookie: {
      expires: 1000 * 60 * 60 * 24,
    },
  })
);

//*Passport
app.use(passport.initialize());
app.use(passport.session());

//*Flash
app.use(flash());

//*Global variables
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  res.locals.user = req.user;
  res.locals.moment = moment;
  res.locals.slugify = slugify;
  next();
});

//* Routes

Logger.info("Loading routes...", "server");

const indexRoute = require("./routes/index");
const usersRoute = require("./routes/users");
const articlesRoute = require("./routes/articles");
const dashboardRoute = require("./routes/dashboard");
const adminRoute = require("./routes/admin");
const apiRoute = require("./routes/api");

app.use(checkBanned, indexRoute);
app.use("/users", checkBanned, usersRoute);
app.use("/articles", checkBanned, articlesRoute);
app.use("/dashboard", checkBanned, ensureAuthenticated, dashboardRoute);
app.use("/admin", ensureAuthenticated, checkAdmin, adminRoute);
app.use("/api", apiRoute);

app.get("*", (req, res) => {
  res.redirect("/404");
});

server.listen(PORT, () => {
  Logger.info(`Server started on port ${PORT}`, "server");
});

// livereloadServer.server.once("connection", () => {
//   setTimeout(() => {
//     livereloadServer.refresh("/");
//   }, 100);
// });

const deleteDoc = require('./utils/deleteDocument');
var interval = 1000 * 60 * 5

Logger.info('Loading automatic scripts...', 'system')

setInterval(async () => {
  await deleteDoc.log();
  await deleteDoc.user()
}, interval)