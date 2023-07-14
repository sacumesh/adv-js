const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const mongoose = require("mongoose");
const session = require("express-session");

const GameRoutes = require("./routes/game");
const WordRoutes = require("./routes/word");
const AuthRoutes = require("./routes/auth");

const AuthGuard = require("./routes/auth-guard");
const authGuard = require("./routes/auth-guard");

try {
  mongoose.connect(process.env.MONGODB);
  console.log("Connected to the db");
} catch (error) {
  console.error("Can't connect to the db");
}

const App = express();
App.use(helmet());
App.use(morgan("common"));
App.use(express.json());
App.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
      httpOnly: true,
    },
  })
);

App.use("/game", authGuard, GameRoutes);
App.use("/word", authGuard, WordRoutes);
App.use("/auth", AuthRoutes);

App.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});
