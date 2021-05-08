//* Dependencies

require('dotenv').config();
const chalk = require('chalk');
const express = require('express');
const app = express();
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const moment = require('moment');
const slugify = require('slugify');
const methodOverride = require('method-override');

//* Variables and functions
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
require('./misc/passport')(passport);
const { ensureAuthenticated } = require('./misc/auth');
const { checkBanned } = require('./misc/check');
const { checkAdmin } = require('./misc/check');
const functions = require('./misc/functions');

//*Database
mongoose.connect(MONGO_URI ,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
}).then(() => {
    console.log(chalk.green('Connected to Mongo'))
}).catch((err) => {
    console.log(chalk.red(`There was an error trying to connect to Mongo\n${err}`))
})

//*Middlware

app.use(bodyParser.urlencoded({ extended: false }));
app.use(methodOverride('_method'))

app.use(expressLayouts);

//*Views
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');
app.use("/public", express.static(__dirname + "/public"));

//*Sessions
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
    cookie: {
        expires: 1000 * 60 * 60 * 24
    }
}))

//*Passport
app.use(passport.initialize())
app.use(passport.session())

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

const indexRoute = require('./routes/index');
const usersRoute = require('./routes/users');
const articlesRoute = require('./routes/articles');
const dashboardRoute = require('./routes/dashboard');
const adminRoute = require('./routes/admin');

app.use(checkBanned, indexRoute);
app.use('/users', checkBanned, usersRoute);
app.use('/articles', checkBanned, articlesRoute);
app.use('/dashboard', checkBanned, ensureAuthenticated, dashboardRoute);
app.use('/admin', ensureAuthenticated, checkAdmin, adminRoute);

app.get('*', (req, res) => {
    res.redirect('/404')
})

app.listen(PORT,() => {
    console.clear();
    console.log(chalk.green(`Server started on port ${PORT}`))
});