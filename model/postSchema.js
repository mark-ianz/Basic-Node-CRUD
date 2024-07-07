const { ObjectId } = require("mongodb");
const mongoose = require ("mongoose");
const Schema = mongoose.Schema

const postSchema = new Schema ({
  author: {
    type: ObjectId,
    ref: 'User',
    required:true
  },
  title: {
    type: String,
    required: true
  }, desc: String
  , imgURL: {
    type: String,
    default: ""
  }
}, {timestamps: true})

const Post = mongoose.model ("Post", postSchema);

module.exports = Post;