const express = require("express");
const {
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
} = require("../../controllers/users/UsersController");
const userRoutes = express.Router();
const { authMiddleware } = require("../../middlewares/auth/authMiddleware");
const {
  photoUpload,
  photoResize,
} = require("../../middlewares/uploads/photoUpload");

userRoutes.post("/register", userRegisterController);
userRoutes.post("/login", loginUserController);
userRoutes.get("/", authMiddleware, fetchUsersController);
userRoutes.delete("/:id", authMiddleware, deleteUserController);
userRoutes.get("/:id", authMiddleware, fetchUserDetailsController);
userRoutes.get("/profile/:id", authMiddleware, userProfileController);
userRoutes.put("/", authMiddleware, updateUserProfileController);
userRoutes.put("/password", authMiddleware, updateUserPasswordController);
userRoutes.put("/follow/:id", authMiddleware, followingUserController);
userRoutes.put("/unfollow/:id", authMiddleware, unfollowUserController);
userRoutes.post(
  "/generate-verify-email-token",
  authMiddleware,
  generateVerificationTokenController
);
userRoutes.get("/verify-account/:token", accountVerificationController);
userRoutes.put("/block/:id", authMiddleware, blockUserController);
userRoutes.put("/unblock/:id", authMiddleware, unblockUserController);
userRoutes.post(
  "/generate-password-reset",
  generateResetPasswordLinkController
);
userRoutes.put("/reset-password/:token", resetPasswordController);
userRoutes.post(
  "/profile-photo-upload",
  authMiddleware,
  photoUpload.single("image"),
  photoResize,
  profilePhotoUploadController
);

module.exports = userRoutes;
