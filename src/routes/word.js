const express = require("express");

const Router = express.Router();

const WordModel = require("../models/word");

Router.post("/", async (request, response) => {
  const { word } = request.body;

  if (/^\d+$/.test(word)) {
    return response.status(400).json({
      error:
        "Invalid word. Word must not be a string representation of a number.",
    });
  }

  const wordModel = new WordModel({
    name: word,
  });

  try {
    await wordModel.save();

    return response.status(200).json({
      msg: word,
    });
  } catch (error) {
    return response.status(500).json({
      error: error.message,
    });
  }
});

module.exports = Router;
