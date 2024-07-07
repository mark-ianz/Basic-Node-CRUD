const { validationResult } = require("express-validator");
const Post = require("../model/postSchema.js");
const User = require("../model/userSchema.js");
const utils = require("../utilities/utils.js");
const mongoose = require ("mongoose")

const render_create = (req, res) => {
  if (!req.session.user) {
    return res.redirect ("/login")
  }

  res.render("posts/create-post", {
    title: "Create Post",
  });
};

const save_post = async (req, res) => {
  /* check for errors */
  const errors = validationResult (req);
  
  if (!errors.isEmpty ()) {
    const firstError = errors.array ()[0];
    return res.json ({message: firstError.msg});
  }

  /* as of now, image upload is not supported so im assigning a default empty value */
  const authorID = req.session.user.id;
  
  try {
    const post = new Post ({...req.body, imgURL: "", author: authorID});
    await post.save();
    return res.json ({post, redirect: "/posts"});
  } catch (error) {
    console.log (error);
    return res.json ({message: "There was an error occured while saving your post. Please try again later."})
  }
};

const get_all = async (req, res) => {
  try {
    const rawPostData = await Post.find().populate('author', '_id username password email imgURL role').sort({ createdAt: -1 }); // returns an array

    const postData = utils.addDatesToArrayObj (rawPostData);


    res.render("posts/posts", {
      title: "Posts",
      postData,
    });
  } catch (error) {
    const error_message =
      "There was an error occured while getting all the posts. Please try again later.";
    utils.handleError(res, 500, "Server Error", error_message);
  }
};

const get_by_id = async (req, res) => {
  const postID = req.params.postID;

  if (!mongoose.Types.ObjectId.isValid (postID)) {
    return utils.handleError (res, 404, "Not Found.", "Post not found.")
  }

  try {
    const rawPostData = await Post.findById(postID).populate('author', '_id username password email imgURL role') // returns an array
    
    const data = utils.addDatesToSingleObj (rawPostData);

    res.render("posts/view-post", {
      title: "View Post",
      data
    });
  } catch (error) {
    const error_message =
      "There was an error occured while getting the post. Please try again later.";
    utils.handleError(res, 500, "Server Error", error_message);
  }
};

const delete_by_id = async (req, res) => {
  const postID = req.params.postID;

  if (!mongoose.Types.ObjectId.isValid (postID)) {
    const error_message = "There user that you are trying to delete was not found. Please try again later.";
    return utils.handleError(res, 404, "Not Found", error_message);
  }

  try {
    await Post.findByIdAndDelete(postID);
    res.json({ redirect: "/posts" });
  } catch (error) {
    const error_message = "There was an error occured while deleting the post. Please try again later.";
    utils.handleError(res, 500, "Server Error", error_message);
  }
};

const search = async (req, res) => {
  const search = req.query.q;
  try {
    const rawData = await Post.find ({title: {$regex: new RegExp (search, "i")}});

    const data = utils.addDatesToArrayObj (rawData);

    res.render("posts/search", { title: "Search", data });
  } catch (error) {
    console.log(error);
    const error_message =
      "There was an error occured while searching all the posts. Please try again later.";
    utils.handleError(res, 500, "Server Error", error_message);
  }
};

module.exports = {
  get_all,
  render_create,
  save_post,
  get_by_id,
  delete_by_id,
  search,
};
