const express = require("express");
const dbConnect = require("./config/db/dbConnect");
const userRoutes = require("./route/users/usersRoutes");
const postRoutes = require("./route/posts/postRoutes");
const { errorHandler, notFound } = require("./middlewares/error/errorHandler");

dbConnect();
const app = express();
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use(express.json());
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, console.log(`Server listening on ${PORT}`));
