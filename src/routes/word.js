const express = require("express");
const Router = express.Router();
const WordModel = require("../models/word");
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;

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

Router.get("/", async (request, response) => {
  try {
    const words = await WordModel.find();

    return response.status(200).json({
      words: words,
    });
  } catch (error) {
    return response.status(500).json({
      error: error.message,
    });
  }
});

Router.get("/", async (request, response) => {
  try {
    const words = await WordModel.find();

    return response.status(200).json({
      words: words.map((word) => word.name),
    });
  } catch (error) {
    return response.status(500).json({
      error: error.message,
    });
  }
});

Router.post("/:id", async (request, response) => {
  const { id } = request.params;
  const { word } = request.body;

  if (/^\d+$/.test(word)) {
    return response.status(400).json({
      error:
        "Invalid word. Word must not be a string representation of a number.",
    });
  }

  try {
    let wordModel;

    if (id) {
      const objectId = new ObjectId(id);
      wordModel = await WordModel.findByIdAndUpdate(
        objectId,
        { name: word },
        { new: true }
      );

      if (!wordModel) {
        return response.status(404).json({
          error: "No word found with the provided ID.",
        });
      }
    }

    return response.status(200).json({
      msg: "Word successfully saved/updated.",
      word: wordModel.name,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return response.status(404).json({
        error: "No word found with the provided ID.",
      });
    }

    return response.status(500).json({
      error: error.message,
    });
  }
});

Router.delete("/:id", async (request, response) => {
  const { id } = request.params;

  try {
    const objectId = new ObjectId(id);
    const deletedWord = await WordModel.findByIdAndDelete(objectId);

    if (!deletedWord) {
      return response.status(404).json({
        error: "No word found with the provided ID.",
      });
    }

    return response.status(200).json({
      msg: "Word successfully deleted.",
      word: deletedWord.name,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return response.status(404).json({
        error: "No word found with the provided ID.",
      });
    }

    return response.status(500).json({
      error: "Server error.",
    });
  }
});

module.exports = Router;
