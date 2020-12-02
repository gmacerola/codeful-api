const express = require("express");
const xss = require("xss");
const UserService = require("./user-service");
const bcrypt = require("bcryptjs");
const { requireAuth } = require("../middleware/jwt-auth");

const userRouter = express.Router();

const serializeUser = (user) => ({
  id: user.id,
  email: xss(user.email),
});

userRouter
  .route("/")
  .get(requireAuth, (req, res) => {
    res.json(serializeUser(req.user));
  })
  .post((req, res) => {
    const knexInstance = req.app.get("db");
    const { password, email } = req.body;
    for (const field of ["email", "password"]) {
      if (!req.body[field]) {
        return res.status(400).json({
          error: `Missing ${field}`,
        });
      }
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: "Password must be 8 or more characters",
      });
    }

    UserService.hasUserWithEmail(knexInstance, email).then((hasUser) => {
      if (hasUser) {
        return res.status(400).json({
          error: "Email already used",
        });
      }

      return UserService.hashPassword(password).then((hashedPassword) => {
        const newUser = {
          email,
          user_password: hashedPassword,
        };

        return UserService.insertUser(knexInstance, newUser).then((user) => {
          res.status(201).json(serializeUser(user));
        });
      });
    });
  });

module.exports = userRouter;
