"use strict";

const DataTypes = require("sequelize").DataTypes;
module.exports = (sequelize) => {
  const User = sequelize.define("user", {
    firstName: {
      type: DataTypes.STRING(256),
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING(256),
      allowNull: false,
    },
    profilePhoto: {
      type: DataTypes.STRING(256),
      defaultValue:
        "https://cdn.pixabay.com/photo/2014/04/02/14/11/male-306408_960_720.png",
    },
    email: {
      type: DataTypes.STRING(256),
      allowNull: false,
      validate: {
        isUnique: function (value, next) {
          var self = this;
          User.findOne({ where: { email: value } })
            .then(function (user) {
              // reject if a different user wants to use the same email
              if (user && self.id !== user.id) {
                return next("Email already in use!");
              }
              return next();
            })
            .catch(function (err) {
              return next(err);
            });
        },
      },
    },
    bio: {
      type: DataTypes.STRING(256),
    },
    password: {
      type: DataTypes.STRING(256),
      allowNull: false,
    },
    postCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    isBlocked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    role: {
      type: DataTypes.STRING(256),
    },
    isFollowing: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isUnFollowing: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isAccountVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    accountVerificationToken: DataTypes.STRING(256),
    accountVerificationTokenExpires: {
      type: DataTypes.DATE,
    },
    viewedBy: {
      type: DataTypes.JSONB,
    },
    followers: {
      type: DataTypes.JSONB,
    },
    following: {
      type: DataTypes.JSONB,
    },
    passwordChangedAt: {
      type: DataTypes.DATE,
    },
    passwordResetToken: {
      type: DataTypes.STRING(256),
    },
    passwordResetExpires: {
      type: DataTypes.DATE,
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  })
  return User;
}
