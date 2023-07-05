const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const mongoose = require("mongoose");

const GameRoutes = require("./routes/game");
const WordRoutes = require("./routes/word");
const AuthRoutes = require("./routes/auth");

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

App.get("/", (request, response) => {
  return response.status(200).send("<h1>It works From GET !</h1>");
});

App.post("/", (request, response) => {
  return response.status(200).send("<h1>It works from POST !</h1>");
});

App.use("/game", GameRoutes);
App.use("/word", WordRoutes);
App.use("/auth", AuthRoutes);

App.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});
