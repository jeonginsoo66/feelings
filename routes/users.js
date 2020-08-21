import express from "express";
import User from "../models/User";
import util from "../util";
import request from "request";

const userRouter = express.Router();

// permission check
const checkPermission = (req, res, next) => {
  const { token, userData } = req.cookies;

  if (!token || !userData) {
    return util.noPermission(req, res);
  } else {
    User.findOne({ username: userData.username }, (err, user) => {
      if (err) {
        return res.json(err);
      }
      if (user._id != userData._id) {
        return util.noPermission(req, res);
      }
      next();
    });
  }
};

// signUp Form
userRouter.get("/signup", (req, res) => {
  const user = req.flash("user")[0] || {};
  const errors = req.flash("errors")[0] || {};
  res.render("users/signUp", { user, errors });
});

// signUp (user create)
userRouter.post("/", (req, res) => {
  User.create(req.body, (err) => {
    if (err) {
      req.flash("user", req.body);
      req.flash("errors", util.parseError(err));
      return res.redirect("/users/signup");
    }
    res.redirect("/");
  });
});

// show
userRouter.get("/:username", checkPermission, (req, res) => {
  const { username } = req.params;

  User.findOne({ username }, (err, user) => {
    if (err) {
      return res.json(err);
    }

    res.render("users/show", { user });
  });
});

// update user form

module.exports = userRouter;
