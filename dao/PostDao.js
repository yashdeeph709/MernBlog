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
const deleteById = (id) => {
  Post.destroy({ where: { id } });
};
module.exports = {
  createPost,
  findAllPosts,
  findPostById,
  incrementPostViews,
  findByIdAndUpdate,
  deleteById,
};
