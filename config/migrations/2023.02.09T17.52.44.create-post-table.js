"use strict";
const Sequelize = require("sequelize");
module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.createTable(
      "posts",
      {
        id: {
          type: Sequelize.UUID,
          primaryKey: true,
          allowNull: false,
        },
        title: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        category: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        image: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        isLiked: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
        },
        numViews: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        likes: {
          type: Sequelize.JSONB,
          default: {},
        },
        dislikes: {
          type: Sequelize.JSONB,
          default: {},
        },
        user_id: {
          type: Sequelize.UUID,
          references: { model: "users", key: "id" },
          allowNull: false,
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
        tableName: "posts",
        schema: "public",
        timestamps: true,
        underscored: true,
      }
    );

    try {
      await queryInterface.addIndex("posts", ["title"]);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log("Error while adding db index! " + e);
    }
  },

  down: async (queryInterface) => {
    queryInterface.dropTable("users");
  },
};
