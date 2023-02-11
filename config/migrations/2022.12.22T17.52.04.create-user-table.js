"use strict";
const Sequelize = require("sequelize");
module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.createTable(
      "users",
      {
        id: {
          type: Sequelize.UUID,
          primaryKey: true,
          allowNull: false,
        },
        firstName: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        lastName: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        profilePhoto: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        email: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        bio: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        password: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        postCount: {
          type: Sequelize.INTEGER,
          allowNull: true,
          default: 0,
        },
        isBlocked: {
          type: Sequelize.BOOLEAN,
          default: false,
        },
        isAdmin: {
          type: Sequelize.BOOLEAN,
          default: false,
        },
        role: {
          type: Sequelize.STRING,
        },
        isFollowing: {
          type: Sequelize.BOOLEAN,
          default: false,
        },
        isUnFollowing: {
          type: Sequelize.BOOLEAN,
          default: false,
        },
        isAccountVerified: {
          type: Sequelize.BOOLEAN,
          default: false,
        },
        accountVerificationToken: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        accountVerificationTokenExpires: {
          type: Sequelize.DATE,
        },
        viewedBy: {
          type: Sequelize.JSONB,
          defaultValue: {}
        },
        followers: {
          type: Sequelize.JSONB,
          defaultValue: {},
        },
        following: {
          type: Sequelize.JSONB,
          defaultValue: {},
        },
        passwordChangedAt: {
          type: Sequelize.DATE,
        },
        passwordResetToken: {
          type: Sequelize.STRING,
        },
        passwordResetExpires: {
          type: Sequelize.DATE,
        },
        active: {
          type: Sequelize.BOOLEAN,
          default: false,
        },
        createdAt: {
          allowNull: false,
          defaultValue: Sequelize.fn("now"),
          type: Sequelize.DATE,
        },
        updatedAt: {
          allowNull: false,
          defaultValue: Sequelize.fn("now"),
          type: Sequelize.DATE,
        },
      },
      {
        tableName: "users",
        schema: "public",
        timestamps: true,
        underscored: true,
      }
    );

    try {
      await queryInterface.addIndex("users", ["email"]);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log("Error while adding db index! " + e);
    }
  },

  down: async (queryInterface) => {
    queryInterface.dropTable("users");
  },
};
