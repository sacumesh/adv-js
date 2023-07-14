const express = require("express");
const bcrypt = require("bcryptjs");
const UserModel = require("../models/user");

const Router = express.Router();
const saltRounds = 10;

Router.post("/register", async (request, response) => {
  const { email, email_cfg, password, password_cfg, active } = request.body;

  const existingUser = await UserModel.findOne({ email });

  if (existingUser) {
    return response.status(400).json({
      error: "You are already registered.",
    });
  }

  if (email !== email_cfg) {
    return response.status(400).json({
      error: "Email and email confirmation do not match.",
    });
  }

  if (password !== password_cfg) {
    return response.status(400).json({
      error: "Password and password confirmation do not match.",
    });
  }

  const saltRounds = 10;
  const hash = await bcrypt.hash(password, saltRounds);

  // Create a new user instance
  const user = new UserModel({
    email,
    password: hash,
    active,
  });

  try {
    await user.save();

    request.session.user = user;

    return response.status(200).json({
      user: user,
    });
  } catch (error) {
    return response.status(500).json({
      error: "Internal server error.",
    });
  }
});

Router.post("/login", async (request, response) => {
  const { email, password } = request.body;

  try {
    const user = await UserModel.findOne({
      email,
      active: true,
    });

    if (!user) {
      return response.status(404).json({
        error: "Invalid email or password.",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return response.status(401).json({
        error: "Invalid email or password.",
      });
    }

    const sanitizedUser = {
      _id: user._id,
      email: user.email,
      active: user.active,
    };

    request.session.user = sanitizedUser;

    return response.status(200).json({
      user: sanitizedUser,
    });
  } catch (error) {
    return response.status(500).json({
      error: "Internal server error.",
    });
  }
});

Router.get("/me", (request, response) => {
  return response.status(200).json({
    user: request.session.user,
  });
});

module.exports = Router;
