const express = require("express");
const AuthService = require("./auth-service");
const authRouter = express.Router();
const jsonParser = express.json();

authRouter.use(cors({ origin: CLIENT_ORIGIN }));

authRouter.route("/login").post(jsonParser, (req, res, next) => {
  const knexInstance = req.app.get("db");
  const { password, email } = req.body;
  const user = { password, email };
  for (const field of ["email", "password"]) {
    for (const field of ["email", "password"]) {
      if (!req.body[field]) {
        return res.status(400).json({
          error: `Missing ${field}`,
        });
      }
    }
  }
  AuthService.getUserWithEmail(knexInstance, email).then((dbUser) => {
    if (!dbUser) {
      return res.status(400).json({
        error: "Incorrect email or password",
      });
    }
    AuthService.comparePasswords(password, dbUser.user_password).then(
      (isMatch) => {
        if (!isMatch) {
          return res.status(400).json({
            error: "Incorrect email or password",
          });
        }
        const subject = dbUser.email;
        const payload = { user_id: dbUser.id };
        res.send({
          authToken: AuthService.createJwt(subject, payload),
        });
      }
    );
  });
});

module.exports = authRouter;
