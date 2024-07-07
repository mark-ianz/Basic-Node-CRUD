const express = require("express");
const router = express.Router();
const {
  render_login,
  render_signup,
  render_profile,
  login_user,
  logged_in_redirect,
  destroy_session,
  save_new_user,
  update_user,
} = require("../controllers/userController.js");
const {
  usernameValidator,
  emailValidator,
  passwordValidator,
  mongoIdValidator,
  checkEmptyBody
} = require("../middlewares/validators.js");

router.get("/login", render_login);

router.get("/signup", render_signup);

router.get(["/profile/:id", "/profile"], mongoIdValidator, render_profile);

/* login handler */
router.post("/login", [checkEmptyBody ("username"), checkEmptyBody ("password")], login_user);

/* signup handler */
router.post(
  "/signup",
  [usernameValidator, emailValidator, passwordValidator],
  save_new_user
);

/* log out */
router.get("/logged", logged_in_redirect);

router.post("/logout", destroy_session);

/* update */
router.put("/user/:id ", update_user);

module.exports = router;
