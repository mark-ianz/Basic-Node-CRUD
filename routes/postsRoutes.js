const express = require("express");
const router = express.Router();
const PostController = require ("../controllers/postsController.js")
const { postValidator } = require ("../middlewares/validators.js");

router.get("/", PostController.get_all);

router.get("/create", PostController.render_create);

router.post("/create", [postValidator], PostController.save_post);

router.get ("/search", PostController.search)

/* place this at the end because they requires parameters */
router.get("/:postID", PostController.get_by_id);

router.delete("/:postID", PostController.delete_by_id);

module.exports = router;
