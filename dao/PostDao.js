const { Post, User } = require("../models")();
const { v4 } = require("uuid");

Post.belongsTo(User, { foreignKey: "user_id" });
const createPost = async (body, user) => {
  const post = await Post.create({
    id: v4(),
    title: body.title,
    category: body.category,
    user_id: user.id,
    description: body.description,
    image: body.image,
  });
  return post;
};
const findAllPosts = async () => {
  const posts = await Post.findAll({ include: [{ model: User }] });
  return posts;
};
const findPostById = async (id) => {
  const post = await Post.findOne({
    where: { id },
    include: [{ model: User }],
  });
  return post;
};
const incrementPostViews = async (id) => {
  const post = await Post.increment("numViews", { by: 1, where: { id: id } });
  return post;
};
const findByIdAndUpdate = async (id, body) => {
  const post = await Post.update(
    {
      title: body.title,
      description: body.description,
      image: body.image,
      category: body.category,
    },
    { where: { id } }
  );
  return post;
};
const deleteById = async (id) => {
  await Post.destroy({ where: { id } });
};

const likesById = async ({ userId, postId }) => {
  const post = await Post.findOne({ where: { id: postId } });
  // If disliked post
  if (post.dislikes && post.dislikes.values) {
    const index = post.dislikes.values.findIndex(
      (like) => like.userId === userId
    );
    if (index !== -1) {
      console.log(
        `dislike found will be reverting the dislike for post ${postId}`
      );
      post.dislikes.values = post.dislikes.values.filter(
        (like) => like.userId !== userId
      );
      await post.save();
    }
  }
  if (!post.likes) {
    post.likes = {};
    post.likes.values = [];
  }
  const index = post.likes.values.findIndex((like) => like.userId === userId);
  if (index === -1) {
    post.likes.values.push({ userId });
  }
  await post.save();
  return post;
};

const dislikesById = async ({ userId, postId }) => {
  const post = await Post.findOne({ where: { id: postId } });
  // If disliked post
  if (post.likes && post.likes.values) {
    const index = post.likes.values.findIndex((like) => like.userId === userId);
    if (index !== -1) {
      console.log(
        `like found will be reverting the dislike for post ${postId}`
      );
      post.likes.values = post.likes.values.filter(
        (like) => like.userId !== userId
      );
      await post.save();
    }
  }
  if (!post.dislikes) {
    post.dislikes = {};
    post.dislikes.values = [];
  }
  const index = post.dislikes.values.findIndex(
    (dislike) => dislike.userId === userId
  );
  if (index === -1) {
    post.dislikes.values.push({ userId });
  }
  await post.save();
  return post;
};

module.exports = {
  createPost,
  findAllPosts,
  findPostById,
  incrementPostViews,
  findByIdAndUpdate,
  deleteById,
  likesById,
  dislikesById,
};
