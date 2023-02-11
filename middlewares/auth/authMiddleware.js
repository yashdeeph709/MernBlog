const expressAsyncHandler = require("express-async-handler");

const jwt = require("jsonwebtoken");
const { User } = require("../../models")();
const { Op } = require("sequelize");

const authMiddleware = expressAsyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      if (token) {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        // find the user by id
        const user = await User.findOne({
          where: {
            id: decoded.id,
            isBlocked: { [Op.not]: true },
          },
        });
        if (user) {
          req.user = user;
        } else {
          throw new Error(
            "You are account is blocked cannot access the application"
          );
        }
      } else {
        throw new Error("No bearer token provided!");
      }
    } catch (error) {
      console.error({ message: error.message, stack: error.stack });
      res.status(401).json({
        message: "Unauthorized Access, Provide a valid Authorization Token",
      });
      return;
    }
  } else {
    throw new Error("No auth header Present");
  }
  next();
});
module.exports = {
  authMiddleware,
};
