const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    _id: {
      type: mongoose.Types.ObjectId,
      default: new ObjectId(),
      required: true,
      ref: "Post",
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    hashed_password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    imgURL: {
      type: String,
      default: "/img/default-profile.svg",
    },
    description: {
      type: String,
    },
    role: {
      type: String,
      default: "member",
      required: true,
    },
    description: {
      type: String,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
