const AWS = require("aws-sdk");
const fs = require("fs");

AWS.config.update({ region: process.env.AWS_REGION });
var credentials = new AWS.SharedIniFileCredentials({ profile: "default" });
AWS.config.credentials = credentials;
const s3Client = new AWS.S3({
  region: process.env.AWS_REGION,
});

function uploadFile(file, fileKey) {
  try {
    console.log(`uploadFile called with file: ${fileKey}`);
    fs.readFile(file, function (err, data) {
      if (err) throw err;

      const params = {
        Bucket: process.env.PROFILE_PHOTO_AWS_BUCKET,
        Key: fileKey,
        Body: data,
      };
      s3Client.upload(params, function (err, result) {
        if (err) throw err;
        console.log(result);
      });
    });
    fs.unlinkSync(file);
  } catch (err) {
    console.error(err);
  }
}
function deleteFile(fileKey) {
  try {
    console.log("deleteFile called with file key: " + fileKey);
    const params = {
      Bucket: process.env.PROFILE_PHOTO_AWS_BUCKET,
      Key: fileKey,
    };
    s3Client.deleteObject(params, function (err, data) {
      if (err) throw err;
      console.log(`file deleted successfully`);
    });
  } catch (err) {
    console.error(err);
  }
}
module.exports = { uploadFile, deleteFile };
