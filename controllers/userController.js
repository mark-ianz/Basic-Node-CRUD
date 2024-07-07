const User = require("../model/userSchema.js");
const {
  handleError,
  addDatesToArrayObj,
  hashPassword,
  compareHashedPassword,
  checkIfDataExist,
} = require("../utilities/utils.js");
const mongoose = require("mongoose");
/* Posts reference for user */
const Post = require("../model/postSchema.js");
const { validationResult, matchedData } = require("express-validator");

const render_login = (req, res) => {
  /* if user already exist in the session, redirect to home */
  if (req.session.user) return res.redirect("/");
  res.render("user/login", { title: "Login" });

};

const render_signup = (req, res) => {
  /* if user already exist in the session, redirect to home */
  if (req.session.user) return res.redirect("/");
  res.render("user/signup", { title: "Signup" });
};

const render_profile = async (req, res) => {
  const paramId = req.params.id;

  /* if there is no user session and no parameter id */
  if (!req.session.user && !paramId) return res.status(401).redirect("/login");

  /* validate the errors from the middleware */
  const errors = validationResult(req);

  /* if there are errors, return user not found */
  if (!errors.isEmpty()) {
    return handleError(res, 404, "User Not Found", "No user found");
  }

  const idQuery = paramId || req.session.user.id;

  try {
    /* get the user */
    const userData = await User.findById(idQuery);
    const rawPostData = await Post.find({ author: idQuery }).populate(
      "author",
      "_id username password email imgURL role"
    ); // returns an array

    /* if the id is valid but no user found */
    if (!userData) {
      return handleError(res, 404, "User Not Found", "No user found");
    }

    /* add the dates difference */
    const postData = addDatesToArrayObj(rawPostData);
    /* respond to the user */
    res.render("user/profile", { title: "Profile", userData, postData });
  } catch (error) {
    console.log(error);
  }
};

const login_user = async (req, res) => {
  /* validate for empty inputs */
  const error = validationResult(req);
  if (!error.isEmpty()) {
    console.log(error);
    const firstError = error.array()[0];
    return res.json({
      message: firstError.msg,
    });
  }

  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    /* if no user found */
    if (!user) {
      return res.status(401).json({
        message: "Incorrect username or password. Please try again.",
      });
    }

    /* if user found, compare if the hashed password matches the password input */
    const isPasswordMatch = await compareHashedPassword(
      password.toString(),
      user.hashed_password
    );

    /* if it does not match */
    if (!isPasswordMatch) {
      return res.status(401).json({
        message: "Incorrect username or password. Please try again.",
      });
    }

    /* initiate session/cookies and login the user*/
    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      imgURL: user.imgURL,
    };

    /* give permission to user */
    req.session.isAuth = true;

    return res.json({ redirect: "/posts" });
  } catch (error) {
    console.log(error);
    handleError(
      res,
      500,
      "Server Error",
      "There was an error while logging in. Please try again later."
    );
  }
};

const save_new_user = async (req, res) => {
  try {
    /* matchedData is the variables that passed the validation */

    /* destructure the matchedData */
    const { username, password, confirm_password, email } = matchedData(req);

    /* validate inputs */
    const error = validationResult(req);

    console.log (error);

    /* if there was an error */
    if (!error.isEmpty()) {
      const firstError = error.array()[0];
      return res.json({ message: firstError.msg });
    }

    /* check if email exist */
    if (await checkIfDataExist(email, "email")) {
      return res.json({ message: "Email already exist." });
    }

    /* check if username exist */
    if (await checkIfDataExist(username, "username")) {
      return res.json({ message: "Username already exist." });
    }

    /* check if password matches */
    if (password !== confirm_password) {
      return res.json({ message: "Password does not match." });
    }

    /* hash the password (async) */
    const hashed_password = await hashPassword(password.toString());
    /* construct the user */
    const user = new User({
      username,
      email,
      hashed_password,
    });
    /* saves the user */
    await user.save();

    /* login the user automatically */
    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      imgURL: user.imgURL,
    };

    /* give permission to user */
    req.session.isAuth = true;

    /* redirect the user */
    res.status(201).json({ redirect: "/posts" });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "There was an error while signing up. Please try again later.",
    });
  }
};

const update_user = async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;
  /* check if the id is valid */
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ message: "Invalid ID" });
  }

  try {
    /* search for id and insert the new value */
    const user = await User.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    });
    if (!user) {
      return res.status(404).json({ message: "No user found" });
    }
    /* respond to user */
    res.json({ message: "Update Successful" });
  } catch (error) {
    const { code, codeName, keyValue } = error;
    /* handles duplicate data when trying to update */
    if (code === 11000 && codeName) {
      const key = Object.keys(keyValue)[0];
      const value = keyValue[key];
      /* itirate in keyValue object to identify what data is duplicated */
      return res.status(409).json({
        message: `The ${key} "${value}" is already taken.`,
      });
    }

    /* if not duplicate, send this error message */
    res.status(500).json({
      error:
        "There was an error while trying to update the information. Please try again later.",
    });
  }
};

const destroy_session = (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      console.log(error);
      res.json({
        message:
          "There was an error occured while trying to logout. Please try again later.",
      });
    }
  });
};

const logged_in_redirect = (req, res) => {
  if (!req.session.user)
    handleError(
      res,
      401,
      "Unauthorized",
      "You are not authorized to access this page."
    );
  res.send(`Welcome, ${req.session.user.username}!`);
};

module.exports = {
  render_login,
  render_signup,
  render_profile,
  save_new_user,
  login_user,
  update_user,
  destroy_session,
  logged_in_redirect,
};
