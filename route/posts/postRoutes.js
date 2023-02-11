const express = require("express");
const { authMiddleware } = require("../../middlewares/auth/authMiddleware");
const {
  createPostController,
  fetchPostsController,
  fetchPostController,
  updatePostController,
  deletePostController,
  toggleLikeController,
  toggleDislikeController,
} = require("../../controllers/posts/PostController");
const {
  photoUpload,
  photoResize,
  postImageResize,
} = require("../../middlewares/uploads/photoUpload");
const postRoutes = express.Router();

postRoutes.post(
  "/",
  authMiddleware,
  photoUpload.single("image"),
  postImageResize,
  createPostController
);
postRoutes.get("/", authMiddleware, fetchPostsController);
postRoutes.get("/:id", authMiddleware, fetchPostController);
postRoutes.put(
  "/:id",
  authMiddleware,
  photoUpload.single("image"),
  postImageResize,
  updatePostController
);
postRoutes.delete("/:id", authMiddleware, deletePostController);
postRoutes.put("/likes/:postId", authMiddleware, toggleLikeController);
postRoutes.put("/dislikes/:postId", authMiddleware, toggleDislikeController);

module.exports = postRoutes;
