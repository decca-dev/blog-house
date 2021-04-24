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
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
require('./misc/passport')(passport);

//*Database
mongoose.connect(MONGO_URI ,{
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log(chalk.green('Connected to Mongo'))
}).catch((err) => {
    console.log(chalk.red(`There was an error trying to connect to Mongo\n${err}`))
})

//*Middleware
app.use(expressLayouts);

//*Views
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');
app.use("/public", express.static(__dirname + "/public"));

app.use(bodyParser.urlencoded({ extended: false }));

//*Sessions
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}))

//*Passport
app.use(passport.initialize())
app.use(passport.session())

//*Flash
app.use(flash());

//*Global variables
app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg")
    res.locals.error_msg = req.flash("error_msg")
    res.locals.error = req.flash("error")
    next();
});

//* Routes

const indexRoute = require('./routes/index');
const usersRoute = require('./routes/users');

app.use(indexRoute);
app.use('/users', usersRoute)

app.listen(PORT,() => {
    console.clear()
    console.log(chalk.green(`Server started on port ${PORT}`))
});