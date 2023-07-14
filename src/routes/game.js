const express = require("express");
const GameModel = require("../models/game");
const WordModel = require("../models/word");
const TryModel = require("../models/try");

const Router = express.Router();

Router.post("/", async (request, response) => {
  const user = request.session.user;

  const word = await WordModel.aggregate([
    {
      $sample: { size: 1 },
    },
  ]);

  if (word.length == 0) {
    return response.status(404).json({ msg: "No words found" });
  }

  const game = new GameModel({
    word: word[0]._id,
    tries: [],
    user: user._id,
  });

  try {
    await game.save();

    request.session.gameId = game._id;

    const { _id, email, username, active } = user;
    const wordLength = word[0].name.length;

    return response.status(200).json({
      user: {
        _id,
        email,
        username,
        active,
      },
      wordLength,
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
    await game.populate.tries("tries");

    return response.status(200).json({
      msg: game,
    });
  } catch (error) {
    return response.status(500).json({
      error: error.message,
    });
  }
});

Router.post("/verify", async (request, response) => {
  const { word } = request.body;
  const { user, gameId } = request.session;
  console.log(gameId);

  try {
    if (!word) {
      return response
        .status(400)
        .json({ msg: "You have to send a 'word' value" });
    }

    const game = await GameModel.findById(gameId)
      .populate("word")
      .populate("user");

    if (!game) {
      return response.status(404).json({ msg: "Game not found" });
    }

    if (game.user._id != user._id) {
      return response.status(404).json({ msg: "Game not found" });
    }

    if (game.ended) {
      return response.status(200).json({
        msg: "The game has ended, beign a new game!",
      });
    }

    const gameWord = game.word.name;

    if (word.length !== gameWord.length) {
      return response
        .status(400)
        .json({ msg: "Word length is not equal to the game word length" });
    }

    result = "";

    if (word === gameWord) {
      game.ended = true;
    }

    for (let i = 0; i < word.length; i++) {
      if (gameWord.includes(word[i])) {
        if (gameWord[i] === word[i]) {
          result += "1";
        } else {
          result += "0";
        }
      } else {
        result += "X";
      }
    }

    const newTry = new TryModel({
      word,
      result,
    });

    game.tries.push(newTry);

    await Promise.all([newTry.save(), game.save()]);

    // await game.populate("tries").execPopulate();

    await game.populate({
      path: "tries",
      options: { sort: { createdAt: -1 } },
    });

    const { word: _, user: __, ...gameData } = game.toObject();

    return response.status(200).json({
      word,
      response: result,
      game: gameData,
    });
  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: "An error occurred" });
  }
});

module.exports = Router;
