const express = require("express");
const GameModel = require("../models/game");
const WordModel = require("../models/Word");
const TryModel = require("../models/try");

const Router = express.Router();

Router.post("/", async (request, response) => {
  const word = await WordModel.aggregate([
    {
      $sample: { size: 1 },
    },
  ]);

  const game = new GameModel({
    word: word[0]._id,
    tries: [],
  });

  try {
    await game.save();

    return response.status(200).json({
      msg: game,
    });
  } catch (error) {
    return response.status(500).json({
      error: error.message,
    });
  }
});

Router.get("/:id", async (request, response) => {
  const { id } = request.params;

  try {
    const game = await GameModel.findOne({ _id: id });

    return response.status(200).json({
      msg: game,
    });
  } catch (error) {
    return response.status(500).json({
      error: error.message,
    });
  }
});

Router.post("/verify/:id", async (request, response) => {
  const { id } = request.params;
  const { word } = request.body;

  try {
    if (!word) {
      return response
        .status(400)
        .json({ msg: "You have to send a 'word' value" });
    }

    const game = await GameModel.findById(id).populate("word");

    if (!game) {
      return response.status(404).json({ msg: "Game not found" });
    }

    const wordFound = game.word.name === word;
    const result = wordFound
      ? "You found the word!"
      : "You didn't find the word!";

    const newTry = new TryModel({
      word,
      result,
    });

    game.tries.push(newTry);

    await Promise.all([newTry.save(), game.save()]);

    return response.status(200).json({ result });
  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: "An error occurred" });
  }
});

module.exports = Router;
