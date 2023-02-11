const expressAsyncHandler = require("express-async-handler");
const { generateToken } = require("../../config/token/generateToken");
const { validateUUID } = require("../../utils/validateUUID");
const { getPasswordHash } = require("../../utils/passwordUtil");
const { sendEmail } = require("../../utils/email");
const _isEmpty = require("lodash").isEmpty;
const crypto = require("crypto");
const { uploadFile } = require("../../utils/s3Operations");
const {
  getUser,
  createUser,
  findAllUsers,
  checkLoginDetails,
  deleteUser,
  updateUser,
  followUser,
  unfollowUser,
  blockUser,
  unblockUser,
  createAccountVerificationToken,
  findByAccountVerificationToken,
  createPasswordResetToken,
  resetPassword,
  findByPasswordResetToken,
  findByEmail,
  findByIdAndUpdateProfilePhoto,
} = require("../../dao/UserDao");

const userRegisterController = expressAsyncHandler(async (req, res) => {
  try {
    //Check if the user is already registered
    console.log("UserRegisterController -> input", req.body);
    const { firstName, lastName, email, password } = req.body;
    const userModal = {
      firstName,
      lastName,
      email,
      password,
    };
    const user = await createUser(userModal);
    console.log("UserRegisterController -> user created", user.toJSON());
    res.status(201).json(user);
  } catch (err) {
    console.error({ message: err.message, stack: err.stack });
    res.status(500).json(err);
  }
});

//Login User
const loginUserController = expressAsyncHandler(async (req, res) => {
  try {
    const user = await checkLoginDetails({
      email: req.body.email,
      password: req.body.password,
    });
    if (!user) {
      res.status(401);
      throw new Error(`Login credentials are invalid`);
    } else {
      console.log(`UsersController.loginUserController ${user}`);
      res.json({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePhoto: user.profilePhoto,
        isAdmin: user.isAdmin,
        token: generateToken(user.id),
      });
    }
  } catch (err) {
    console.error({ message: err.message, stack: err.stack });
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

// get all users
const fetchUsersController = expressAsyncHandler(async (req, res) => {
  try {
    console.log(
      "UserController.fetchUsersController() -> input",
      req.body,
      req.params
    );
    const users = await findAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json(error);
  }
});

//Delete User
const deleteUserController = expressAsyncHandler(async (req, res) => {
  try {
    console.log(
      `UsersController.deleteUserController() -> input`,
      req.body,
      req.params
    );

    // Delete User by ID
    const count = await deleteUser(req.params.id);
    if (!count) {
      console.log(
        `UsersController.deleteUserController() -> User doesn't exist with id ${req.params.id}`
      );
      throw new Error(`No such user exists ${req.params.id}`);
    }
    res.status(200).json({ NumberOfUsersDeleted: count });
    console.log(
      `UsersController.deleteUserController() -> user deleted successfully!`
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// User Details API
const fetchUserDetailsController = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    console.log(
      `UsersController.fetchUserDetailsController() -> input ${req.body} ${req.params}`
    );
    //Check if _id is valid
    if (_isEmpty(id)) {
      throw new Error("id cannot be empty");
    }

    validateUUID(id);
    console.log(
      `UsersController.fetchUserDetailsController() -> ID provided is valid `
    );
    const user = await getUser(id);
    if (!user) {
      throw new Error(`User not found with id ${id}`);
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// User Profile
const userProfileController = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  console.log(
    `UsersController.userProfileController() -> input ${req.body} ${req.params}`
  );

  if (_isEmpty(id)) {
    throw new Error("id cannot be empty");
  }

  validateUUID(id);
  console.log(
    `UsersController.userProfileController() -> provided id is valid mongo id`
  );
  try {
    const myProfile = await getUser(id);
    if (!myProfile) {
      throw new Error(`Profile with this ${id} not found!`);
    }
    res.status(200).json(myProfile);
  } catch (error) {
    res.json({ message: error.message });
  }
});

//Update Profile
const updateUserProfileController = expressAsyncHandler(async (req, res) => {
  const { id } = req.user;
  try {
    const userToBeUpdated = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
    };
    const user = await updateUser(id, userToBeUpdated);
    res.json(user);
  } catch (err) {
    if (err.name === "SequelizeValidationError") {
      return res.status(500).json({ message: err.errors[0].messsage });
    }
    res.json({ message: err.message });
  }
});

//Update password

const updateUserPasswordController = expressAsyncHandler(async (req, res) => {
  const { id } = req.user;
  const { password } = req.body;
  validateUUID(id);

  try {
    if (password) {
      req.user.password = getPasswordHash(password);
      const updatedUser = await req.user.save();
      res.status(200).json(updatedUser);
    }
  } catch (err) {
    console.log(`error occurred: ${err.message} ${err.stack}`);
    res.status(500).json({ message: err.message });
  }
});

//Following

const followingUserController = expressAsyncHandler(async (req, res) => {
  try {
    const id = req.params.id;

    validateUUID(id);

    const loggedInUser = req.user;
    const followingUser = await getUser(id);
    if (followingUser) {
      await followUser(loggedInUser, followingUser);
    } else {
      res
        .status(404)
        .send({ message: "User your trying to follow does not exist" });
    }
    res.status(200).send({ message: "User followed successfully" });
  } catch (err) {
    console.log(`error occurred: ${err.message} ${err.stack}`);
    res.status(500).json({ message: err.message });
  }
});

const unfollowUserController = expressAsyncHandler(async (req, res) => {
  try {
    const loggedInUser = req.user;
    const followingUser = await getUser(req.params.id);

    if (followingUser) {
      await unfollowUser(loggedInUser, followingUser);
    } else {
      res
        .status(404)
        .send({ message: "User your trying to unfollow does not exist" });
    }
    res.status(200).json({ message: "User unfollowed successfully" });
  } catch (err) {
    console.log(`error occurred: ${err.message} ${err.stack}`);
    res.status(500).json({ message: err.message });
  }
});

const blockUserController = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  validateUUID(id);

  try {
    const user = await blockUser(id);
    console.log(`${user} blocked successfully`);
    res.status(200).json({ message: `user block successfully` });
  } catch (err) {
    console.log(`error occurred: ${err.message} ${err.stack}`);
    res.status(500).json({ message: err.message });
  }
});

const unblockUserController = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  validateUUID(id);

  try {
    const user = await unblockUser(id);
    console.log(`${user} unblocked successfully`);
    res.status(200).json({ message: `user unblock successfully` });
  } catch (err) {
    console.log(`error occurred: ${err.message} ${err.stack}`);
    res.status(500).json({ message: err.message });
  }
});

const generateVerificationTokenController = expressAsyncHandler(
  async (req, res) => {
    try {
      const tokenData = await createAccountVerificationToken();
      const expiresIn = Date.now() + 30 * 60 * 1000;

      req.user.accountVerificationToken = tokenData.accountVerificationToken;
      req.user.accountVerificationTokenExpires = expiresIn;
      req.user.save();
      const resetURL = `If you have requested to reset your account, verify your account now within 10 minutes.
      <a href="https://localhost:3000/api/users/verify-account/${tokenData.verificationToken}>Click here</a>`;
      sendEmail(
        ["yashdeeph709@gmail.com"],
        [],
        "Account Verification Email",
        resetURL
      );
      res.status(200).json({ message: "Verification token generated." });
    } catch (err) {
      console.log(`error occured: ${err.message} ${err.stack}`);
      res.status(500).json({ message: err.message });
    }
  }
);

const accountVerificationController = expressAsyncHandler(async (req, res) => {
  try {
    const token = req.params.token;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await findByAccountVerificationToken(hashedToken);
    console.log(user.accountVerificationTokenExpires);
    if (user && user.accountVerificationTokenExpires > Date.now()) {
      user.isAccountVerified = true;
      user.save();
      res.status(200).json({ message: "Account verified" });
    } else {
      res.status(403).json({ message: "Account not found" });
    }
  } catch (err) {
    console.log(`error occured: ${err.message} ${err.stack}`);
    res.status(500).json({ message: err.message });
  }
});

//Forget password link generation
const generateResetPasswordLinkController = expressAsyncHandler(
  async (req, res) => {
    try {
      const { passwordResetToken, token } = await createPasswordResetToken();
      const user = await findByEmail(req.body.email);
      console.log(
        `UsersController.forgetPasswordController() -> ${passwordResetToken} ${token}`
      );

      const passwordResetLink = `http://localhost:3000/api/users/resetPassword/${token}`;
      sendEmail(
        ["yashdeeph709@gmail.com"],
        [],
        "Password reset",
        passwordResetLink
      );
      user.passwordResetToken = passwordResetToken;
      user.passwordResetExpires = Date.now() + 30 * 60 * 1000;
      user.save();
      res
        .status(200)
        .json({ message: "Password reset token generated successfully!" });
    } catch (err) {
      console.error(`error occured ${err.message} ${err.stack}`);
      res.status(500).json({ message: err.message });
    }
  }
);

const resetPasswordController = expressAsyncHandler(async (req, res) => {
  try {
    const token = req.params.token;

    const passwordResetToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    console.log(
      `UsersController.resetPasswordController() -> ${passwordResetToken} ${token}`
    );
    const user = await findByPasswordResetToken(passwordResetToken);
    if (user && user.passwordResetExpires > Date.now()) {
      if (req.body.password === req.body.retypePassword) {
        resetPassword(user.id, req.body.password);
        res.status(200).json({ message: "Password reset successfully" });
      } else {
        res
          .status(403)
          .json({ message: "Password and retyped password do not match" });
      }
    } else {
      res.status(403).json({ message: "Password Reset Token expired!" });
    }
  } catch (err) {
    console.error(`error occured ${err.message} ${err.stack}`);
    res.status(500).json({ message: err.message });
  }
});

// Profile photo upload controller
const profilePhotoUploadController = expressAsyncHandler(async (req, res) => {
  try {
    const { id } = req.user;
    const localPath = `public/profile/${req.file.filename}`;

    const uploadedImage = uploadFile(localPath, req.file.filename);
    console.log(`Uploaded profile photo: ${uploadedImage}`);

    const result = await findByIdAndUpdateProfilePhoto(id, req.file.filename);

    res
      .status(200)
      .json({ message: "Profile photo uploaded successfully", result });
  } catch (err) {
    console.log(`error occured file uploading profile photo`, err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = {
  userRegisterController,
  loginUserController,
  fetchUsersController,
  deleteUserController,
  fetchUserDetailsController,
  userProfileController,
  updateUserProfileController,
  updateUserPasswordController,
  followingUserController,
  unfollowUserController,
  blockUserController,
  unblockUserController,
  generateVerificationTokenController,
  accountVerificationController,
  generateResetPasswordLinkController,
  resetPasswordController,
  profilePhotoUploadController,
};
