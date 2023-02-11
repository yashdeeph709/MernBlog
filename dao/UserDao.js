const { getPasswordHash, comparePassword } = require("../utils/passwordUtil");
const { User, Post } = require("../models")();
const { validateUUID } = require("../utils/validateUUID");
const { v4 } = require("uuid");
const _isEmpty = require("lodash").isEmpty;
const _remove = require("lodash").remove;
const {
  CANNOT_FOLLOW_YOURSELF,
  USER_ALREADY_FOLLOWED,
  UNABLE_TO_UNFOLLOW_USER,
} = require("../utils/errorConstants");
const crypto = require("crypto");

User.hasMany(Post, { foreignKey: "user_id" });
const getUser = async (id) => {
  try {
    const user = await User.findOne({
      where: { id },
      include: [{ model: Post }],
    });
    return user;
  } catch (err) {
    console.log(`UserDao.getUser() error: ${err.stack}`);
    throw err;
  }
};

const createUser = async (user) => {
  try {
    user.password = await getPasswordHash(user.password);
    const createdUser = await User.create({
      id: v4(),
      ...user,
    });
    return createdUser;
  } catch (err) {
    console.log(`UserDao.createUser() error: ${err}`);
    throw err;
  }
};

const checkLoginDetails = async ({ email, password }) => {
  try {
    if (_isEmpty(password) || _isEmpty(password)) {
      throw new Error(`Invalid username and password`);
    }
    const user = await User.findOne({
      where: {
        email,
      },
    });
    if (
      !user ||
      (user && !comparePassword(password, user.password)) ||
      user.isBlocked
    ) {
      return null;
    }
    return user;
  } catch (err) {
    console.log(
      `UserDao.checkLoginDetails: error while logging in ${err.stack}`
    );
    throw err;
  }
};

const findAllUsers = async () => {
  try {
    const users = await User.findAll();
    return users;
  } catch (err) {
    console.log(`UserDao.findAllUsers : error while logging in ${err.stack}`);
    throw err;
  }
};

const deleteUser = async (id) => {
  try {
    validateUUID(id);

    return User.destroy({
      where: {
        id,
      },
      returning: true,
    });
  } catch (err) {
    console.log(`UserDao.deleteUser : error while logging in ${err.stack}`);
    throw err;
  }
};

const updateUser = async (userId, { firstName, lastName, email, bio }) => {
  try {
    const user = await User.findOne({ where: { id: userId } });
    const userUpdated = await user.update({
      firstName: firstName,
      lastName: lastName,
      email: email,
    });
    return userUpdated;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const followUser = async (follower, followee) => {
  // Add follower to followee's followers list
  if (followee.id === follower.id) {
    throw new Error(CANNOT_FOLLOW_YOURSELF);
  }
  if (!followee.followers.list) {
    console.log(`UserDao.followUser() -> followers list is empty`);
    followee.followers.list = [];
  }
  console.log(
    `UserDao.followUser() -> followers list is: ${followee.followers.list}`
  );
  if (!followee.followers.list.includes(follower.id)) {
    followee.followers.list.push(follower.id);
    await User.update(
      {
        "followers.list": followee.followers.list,
      },
      { where: { id: followee.id } }
    );
  } else {
    throw new Error(USER_ALREADY_FOLLOWED);
  }

  //Add followee to follower's followings list
  if (!follower.following.list) {
    console.log(`UserDao.followUser() -> following list is empty`);
    follower.following.list = [];
  }
  console.log(
    `UserDao.followUser() -> following list is now: ${follower.following.list}`
  );
  if (!follower.following.list.includes(followee.id)) {
    follower.following.list.push(followee.id);
    await User.update(
      {
        "following.list": follower.following.list,
      },
      { where: { id: follower.id } }
    );
  } else {
    throw new Error(USER_ALREADY_FOLLOWED);
  }
};

const unfollowUser = async (follower, followee) => {
  // Remove the logged in user from the followee's followers list
  if (
    followee.followers.list &&
    followee.followers.list.length > 0 &&
    followee.followers.list.includes(follower.id)
  ) {
    console.log(
      `UserDao.unfollowUser() -> followers.list is ${followee.followers.list}`
    );

    followee.followers.list = _remove(
      followee.followers.list,
      (item) => item.id === follower.id
    );
    await User.update(
      {
        "followers.list": followee.followers.list,
      },
      { where: { id: followee.id } }
    );
  } else {
    throw new Error(UNABLE_TO_UNFOLLOW_USER);
  }
  // Remove the followee from the logged in user's following list
  if (
    follower.following.list &&
    follower.following.list.length > 0 &&
    follower.following.list.includes(followee.id)
  ) {
    console.log(
      `UserDao.unfollowUser() -> following.list is ${follower.following.list}`
    );

    follower.following.list = _remove(
      follower.following.list,
      (item) => item.id === followee.id
    );
    await User.update(
      {
        "following.list": follower.following.list,
      },
      { where: { id: follower.id } }
    );
  } else {
    throw new Error(UNABLE_TO_UNFOLLOW_USER);
  }
};

const blockUser = async (id) => {
  const user = await User.findOne({
    where: { id: id },
  });
  if (user == null) {
    throw new Error("User does not exist");
  }
  user.isBlocked = true;
  user.save();
  return user;
};

const unblockUser = async (id) => {
  const user = await User.findOne({
    where: { id: id },
  });
  if (user == null) {
    throw new Error("User does not exist");
  }
  user.isBlocked = false;
  user.save();
  return user;
};
const findByAccountVerificationToken = async (hashedToken) => {
  const user = await User.findOne({
    where: { accountVerificationToken: hashedToken },
  });
  return user;
};
const createAccountVerificationToken = async () => {
  const verificationToken = crypto.randomBytes(32).toString("hex");

  const accountVerificationToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");
  return { accountVerificationToken, verificationToken };
};

const createPasswordResetToken = async () => {
  const token = crypto.randomBytes(32).toString("hex");

  const passwordResetToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  return { passwordResetToken, token };
};

const findByPasswordResetToken = async (passwordResetToken) => {
  const user = await User.findOne({
    where: { passwordResetToken: passwordResetToken },
  });
  return user;
};
const resetPassword = async (userId, password) => {
  const user = await User.findOne({ where: { id: userId } });

  user.password = await getPasswordHash(password);
  user.passwordResetToken = null;
  user.passwordResetExpires = null;
  user.save();
};

const findByEmail = async (email) => {
  const user = await User.findOne({ where: { email: email } });
  return user;
};
const findByIdAndUpdateProfilePhoto = async (id, profilePhoto) => {
  const user = await User.findOne({ where: { id } });
  user.profilePhoto = profilePhoto;
  user.save();
  return user;
};

module.exports = {
  getUser,
  createUser,
  checkLoginDetails,
  findAllUsers,
  updateUser,
  deleteUser,
  followUser,
  unfollowUser,
  blockUser,
  unblockUser,
  findByAccountVerificationToken,
  createAccountVerificationToken,
  createPasswordResetToken,
  findByPasswordResetToken,
  resetPassword,
  findByEmail,
  findByIdAndUpdateProfilePhoto,
};
