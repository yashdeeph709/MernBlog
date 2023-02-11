const dbConnect = require("../config/db/dbConnect");

module.exports = () => {
  const connection = dbConnect();
  return {
    User: require("./user/User")(connection),
    Post: require("./post/Post")(connection),
  };
};
