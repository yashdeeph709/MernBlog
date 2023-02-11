const multer = require("multer");
const sharp = require("sharp");
const path = require("path");

const multerStorage = multer.memoryStorage();

//file type checking
const multerFilter = (req, file, cb) => {
  //check if the file has right type

  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    //reject if the file is not image
    cb(
      {
        message: "Unsupported file type",
      },
      false
    );
  }
};

const photoUpload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: { fileSize: 1000000 },
});

const photoResize = async (req, res, next) => {
  //check if there is no file to resize
  if (!req.file) {
    return next();
  }
  req.file.filename = `user-${Date.now()}-${req.file.originalname}`;
  console.log("Resize middleware", req.file);
  await sharp(req.file.buffer)
    .resize(250, 250)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/profile/${req.file.filename}`);

  next();
};

const postImageResize = async (req, res, next) => {
  //check if there is no file to resize
  if (!req.file) {
    return next();
  }
  req.file.filename = `post-${Date.now()}-${req.file.originalname}`;
  console.log("Resize middleware", req.file);
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/post/${req.file.filename}`);

  next();
};
module.exports = {
  photoUpload: photoUpload,
  photoResize: photoResize,
  postImageResize: postImageResize,
};
