"use strict";

const DataTypes = require("sequelize").DataTypes;
module.exports = (sequelize) => {
  const Post = sequelize.define("post", {
    title: {
      type: DataTypes.STRING(256),
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING(256),
      allowNull: false,
      defaultValue: "All",
    },
    isLiked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    numViews: {
      type: DataTypes.NUMBER,
      defaultValue: 0,
    },
    likes: {
      type: DataTypes.JSONB,
    },
    dislikes: {
      type: DataTypes.JSONB,
    },
    user_id: {
      type: DataTypes.UUID,
      references: { model: "users", key: "id" },
    },
    description: {
      type: DataTypes.STRING,
    },
    image: {
      type: DataTypes.STRING,
      defaultValue:
        "https://cdn.pixabay.com/photo/2014/04/02/14/11/male-306408_960_720.png",
    },
  });
  return Post;
};
