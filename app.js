const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const port = 3000;

// const postsRouter = require("./routes/posts.js");
const usersRouter = require("./routes/users.js");
// const authRouter = require("./routes/auth.js");

app.use(express.json());
app.use(cookieParser());

app.use("/", [usersRouter]);

app.listen(port, () => {
  console.log(port, "포트로 서버가 열렸어요!");
});