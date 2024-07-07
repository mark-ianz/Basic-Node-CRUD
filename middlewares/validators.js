const { query, param, body, validationResult } = require("express-validator");

const usernameValidator = [
  /* restrict special characters!! */
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username is required.")
    .isString()
    .withMessage("Username must be a string.")
    .isLength({ min: 4, max: 16 })
    .withMessage("Username must be at least 4 to 16 characters."),
];

const emailValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required.")
    .isString()
    .withMessage("Email must be a string.")
    .isLength({ min: 4, max: 256 })
    .withMessage("Email must be at least 4 to 256 characters.")
    .isEmail()
    .withMessage("Email is not valid. Please check your input."),
];

const passwordValidator = [
  body(["password", "confirm_password"])
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .isString()
    .withMessage("Password must be a string.")
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minSymbols: 1,
    })
    .withMessage(
      "Password must be strong. Include at least 1 lowercase letter, 1 uppercase letter, 1 number, 1 special symbol and at least 8 characters."
    ),
];

const postValidator = [
  body (["title"])
    .trim ()
    .notEmpty ()
    .withMessage ("Title is required."),
  body (["desc"])
    .trim ()
    .optional ()
    .isLength ({max: 256})
    .withMessage ("Maximum description of 256 character has been exceeded.")
]

function checkEmptyBody(value) {
  return [body(value).notEmpty().withMessage("All fields are required.")];
}

const mongoIdValidator = [param("id").isMongoId().optional()];

module.exports = {
  usernameValidator,
  emailValidator,
  passwordValidator,
  mongoIdValidator,
  checkEmptyBody,
  postValidator
};
