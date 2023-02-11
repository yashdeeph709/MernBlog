const PostDao = require("../../dao/PostDao");
const Filter = require("bad-words");
const expressAsyncHandler = require("express-async-handler");
const { uploadFile, deleteFile } = require("../../utils/s3Operations");
const { validateUUID } = require("../../utils/validateUUID");

const createPostController = expressAsyncHandler(async (req, res) => {
  try {
    const filter = new Filter();
    const isDescriptionProfane = filter.isProfane(req.body.description);
    const isTitleProfane = filter.isProfane(req.body.title);
    if (!isDescriptionProfane && !isTitleProfane) {
      const localPath = `public/post/${req.file.filename}`;

      const post = await PostDao.createPost(
        { ...req.body, image: req.file.filename },
        req.user
      );

      uploadFile(localPath, post.id);
      res.status(201).json(post);
    } else {
      req.user.isBlocked = true;
      req.user.save();
      res
        .status(500)
        .json({ message: "Your post contains profanity. You are blocked" });
    }
  } catch (e) {
    console.error(
      "PostController.createPostController() => error: " + e.message,
      e.stack
    );
    res.status(500).json({ message: e.message });
  }
});

const fetchPostsController = expressAsyncHandler(async (req, res) => {
  try {
    const posts = await PostDao.findAllPosts();
    res.status(200).json(posts);
  } catch (e) {
    console.error(`PostController.fetchPostsController() => error:`, e.message);
    res.status(500).json({ message: e.message });
  }
});

//Fetch single post
const fetchPostController = expressAsyncHandler(async (req, res) => {
  try {
    const id = req.params.id;
    validateUUID(id);
    const post = await PostDao.findPostById(id);
    PostDao.incrementPostViews(id);
    res.status(200).json(post);
  } catch (err) {
    console.error(`PostController.fetchPostController() => error:`, e.message);
    res.status(500).json({ message: e.message });
  }
});

//Update post controller
const updatePostController = expressAsyncHandler(async (req, res) => {
  try {
    const id = req.params.id;
    validateUUID(id);
    const post = await PostDao.findByIdAndUpdate(id, {
      ...req.body,
      image: req.file.filename,
    });
    const localPath = `public/post/${req.file.filename}`;
    deleteFile(id);
    uploadFile(localPath, id);
    res.status(200).json(post);
  } catch (err) {
    console.error(
      `PostController.updatePostController() => error:`,
      err.message
    );
    res.status(500).json({ message: err.message });
  }
});

const deletePostController = expressAsyncHandler(async (req, res) => {
  try {
    const id = req.params.id;
    validateUUID(id);
    await PostDao.deleteById(id);
    res.status(200).json({ message: `Post deleted successfully` });
  } catch (err) {
    console.error(`PostController.deletePostController error: ${err.message}`);
    res.status(500).json({ message: err.message });
  }
});

// Likes
const toggleLikeController = expressAsyncHandler(async (req, res) => {
  try {
    const { postId } = req.params;
    validateUUID(postId);
    const post = await PostDao.likesById({
      userId: req.user.id,
      postId: postId,
    });
    res.status(200).json(post);
  } catch (err) {
    console.error(`PostController.toggleLikeController error: ${err.message}`);
    res.status(500).json({ message: err.message });
  }
});

const toggleDislikeController = expressAsyncHandler(async (req, res) => {
  try {
    const { postId } = req.params;
    validateUUID(postId);
    const post = await PostDao.dislikesById({
      userId: req.user.id,
      postId: postId,
    });
    res.status(200).json(post);
  } catch (err) {
    console.error(
      `PostController.toggleDislikeController error: ${err.message}`
    );
    res.status(500).json({ message: err.message });
  }
});

module.exports = {
  createPostController,
  fetchPostsController,
  fetchPostController,
  updatePostController,
  deletePostController,
  toggleLikeController,
  toggleDislikeController,
};
