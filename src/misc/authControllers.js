const passport = require("passport");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const JWT_KEY = process.env.JWT_KEY;
const JWT_RESET = process.env.JWT_RESET_KEY;
const EMAIL = process.env.EMAIL;
const PASSWORD = process.env.PASSWORD;
const User = require("../models/User");
const mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);

exports.registerHandle = async (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];

  //*Check required fields

  if (!name || !email || !password || !password2) {
    errors.push({ msg: "Please fill in all the fields.\n" });
  }

  //*Check passwod match
  if (password !== password2) {
    errors.push({ msg: "Passwords don't match.\n" });
  }

  //*Check password length
  if (password.length < 8) {
    errors.push({ msg: "Password should be at least 8 characters.\n" });
  }

  const existingName = await User.findOne({ name: name });

  if (existingName) {
    errors.push({ msg: "That name is already taken!\n" });
  }

  if (errors.length > 0) {
    res.render("register", {
      errors,
      name,
      email,
      password,
      password2,
      title: "BlogHouse",
      description: "Register an account with BlogHouse",
      route: "/users/register",
    });
  } else {
    //*Validation
    User.findOne({ email: email }).then(async (user) => {
      if (user) {
        //!User with the same email
        errors.push({ msg: "Email already registered!" });
        res.render("register", {
          errors,
          name,
          email,
          password,
          password2,
          title: "BlogHouse",
          description: "Register an account with BlogHouse",
          route: "/users/register",
        });
      } else {
        const token = jwt.sign({ name, email, password }, JWT_KEY, {
          expiresIn: "30m",
        });
        const CLIENT_URL = `http://${req.headers.host}`;

        const output = `
                <h2>Click on the link below to finish your registeration</h2>
                <p>${CLIENT_URL}/users/activate/${token}</p>
                <p><b>NOTE: </b>The link will expire in 30 minutes.</p>
                `;

        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: EMAIL,
            pass: PASSWORD,
          },
        });

        const mailOptions = {
          from: EMAIL,
          to: email,
          subject: "Verify your email to finish account creation",
          html: output,
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.log(error);
            req.flash(
              "error_msg",
              "Something went wrong while trying to send verification email. Please try again."
            );
            res.render("register", {
              errors,
              name,
              email,
              password,
              password2,
              title: "BlogHouse",
              description: "Register an account with BlogHouse",
              route: "/users/register",
            });
          } else {
            req.flash(
              "success_msg",
              "Activation link sent. Please click on that link to log in."
            );
            res.redirect("/users/login");
          }
        });
      }
    });
  }
};

exports.activateHandle = async (req, res) => {
  const token = req.params.token;

  let errors = [];

  if (token) {
    jwt.verify(token, JWT_KEY, (err, decodedToken) => {
      if (err) {
        req.flash(
          "error_msg",
          "Incorrect or expired link! Please register again."
        );
        res.redirect("/users/register");
      } else {
        const { name, email, password } = decodedToken;

        User.findOne({ email: email }).then(async (user) => {
          if (user) {
            //!User with the same email
            req.flash("error_msg", "That email is already registered!");
            res.redirect("/users/register");
          } else {
            const newData = new User({
              name,
              email,
              password,
            });

            //*Hash password
            bcrypt.genSalt(10, (err, salt) => {
              bcrypt.hash(newData.password, salt, (err, hash) => {
                if (err) throw err;

                //*Set password to hashed
                newData.password = hash;
                //*Save user
                newData
                  .save()
                  .then((user) => {
                    req.flash(
                      "success_msg",
                      "Registered Successfully! You can now log in"
                    );
                    res.redirect("/users/login");
                  })
                  .catch((err) => console.error(err));
              });
            });
          }
        });
      }
    });
  } else {
    console.log("Account activation error!");
  }
};

exports.loginHandle = async (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/users/login",
    failureFlash: true,
  })(req, res, next);
};

exports.logoutHandle = async (req, res) => {
  req.logout();
  req.flash("success_msg", "You have logged out!");
  res.redirect("/users/login");
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  let errors = [];

  if (!email) {
    errors.push({ msg: "Please enter an email adress." });
  }

  if (errors.length > 0) {
    res.render("forgot", {
      errors,
      email,
      title: "BlogHouse",
      description: "Password recovery",
      route: "/users/forgot",
    });
  } else {
    User.findOne({ email: email }).then(async (user) => {
      if (!user) {
        errors.push({ msg: "Couldn't find any users with that email adress." });
        res.render("forgot", {
          errors,
          email,
          title: "BlogHouse",
          description: "Password recovery",
          route: "/users/forgot",
        });
      } else {
        const token = jwt.sign({ _id: user._id }, JWT_RESET, {
          expiresIn: "30m",
        });
        const CLIENT_URL = `http://${req.headers.host}`;

        const output = `
                <h2>Click on the link below to reset your account's password</h2>
                <p>${CLIENT_URL}/users/forgot/${token}</p>
                <p><b>NOTE: </b>The link will expire in 30 minutes.</p>
                `;

        User.updateOne({ resetLink: token }, (err, success) => {
          if (err) {
            errors.push({ msg: "Error resetting password" });
            res.render("forgot", {
              errors,
              email,
              title: "BlogHouse",
              description: "Password recovery",
              route: "/users/forgot",
            });
          } else {
            const transporter = nodemailer.createTransport({
              service: "gmail",
              auth: {
                user: EMAIL,
                pass: PASSWORD,
              },
            });

            const mailOptions = {
              from: EMAIL,
              to: email,
              subject: "Account password reset",
              html: output,
            };

            transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                console.log(error);
                req.flash(
                  "error_msg",
                  "Something went wrong while trying to send password reset email. Please try again."
                );
                res.render("forgot", {
                  errors,
                  email,
                  title: "BlogHouse",
                  description: "Password recovery",
                  route: "/users/forgot",
                });
              } else {
                req.flash(
                  "success_msg",
                  "Activation link sent. Please follow the instructions."
                );
                res.redirect("/users/login");
              }
            });
          }
        });
      }
    });
  }
};

exports.gotoReset = async (req, res) => {
  const { token } = req.params;

  if (token) {
    jwt.verify(token, JWT_RESET, (err, decodedToken) => {
      if (err) {
        req.flash("error_msg", "Incorrect or expired link! Please try again.");
        res.redirect("/users/login");
      } else {
        const { _id } = decodedToken;
        User.findById(_id, (err, user) => {
          if (err) {
            req.flash(
              "error_msg",
              "couldn't find any users with that email adress."
            );
            res.redirect("/users/login");
          } else {
            res.redirect(`/users/reset/${_id}`);
          }
        });
      }
    });
  } else {
    console.log("Password reset error");
  }
};

exports.resetPassword = async (req, res) => {
  var { password, password2 } = req.body;
  const id = req.params.id;
  const errors = [];

  if (!password || !password2) {
    req.flash("error_msg", "Please fill in all fields");
    res.redirect(`/users/reset/${id}`);
  } else if (password.length < 8) {
    req.flash("error_msg", "Password must be at least 8 characters.");
    res.redirect(`/users/reset/${id}`);
  } else if (password !== password2) {
    req.flash("error_msg", "Passwords don't match!");
    res.redirect(`/users/reset/${id}`);
  } else {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(password, salt, (err, hash) => {
        if (err) throw err;

        password = hash;

        User.findByIdAndUpdate(
          { _id: id },
          { password },
          function (err, result) {
            if (err) {
              req.flash("error_msg", "Error trying to reset password!");
              res.redirect(`/users/reset/${id}`);
            } else {
              req.flash("success_msg", "Password reset successfully!");
              res.redirect("/users/login");
            }
          }
        );
      });
    });
  }
};

exports.githubLoginHandle = async (req, res, next) => {
  passport.authenticate("github", {
    successRedirect: "/",
    failureRedirect: "/form",
    failureFlash: true,
  })(req, res, next);
}