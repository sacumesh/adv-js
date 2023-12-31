const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema(
  {
    word: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Word",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    tries: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Try",
      },
    ],
    ended: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Game", gameSchema);
