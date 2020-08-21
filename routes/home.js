import express from "express";
import request from "request";

const homeRouter = express.Router();

let getToken = null;

// getToken function
const getTokenPromise = (username, password, method) => {
  const signPro = new Promise((resolve, reject) => {
    request(
      {
        url: "http://localhost:4100/api/auth/login",
        form: {
          username,
          password,
        },
        method,
        json: true,
      },
      (e, r, body) => {
        console.log(body);
        resolve(body);
      }
    );
  });

  return signPro;
};

// index
homeRouter.get("/", (req, res) => {
  const token = req.cookies;

  console.log(req.cookies.userData);

  res.render("home/", { token });
});

// sign in form
homeRouter.get("/signin", (req, res) => {
  const username = req.flash("username")[0];
  const errors = req.flash("errors")[0] || {};
  res.render("home/signin", { username, errors });
});

// sign in (generate token)
homeRouter.post(
  "/signin",
  (req, res, next) => {
    let errors = {};
    let isValid = true;

    if (!req.body.username) {
      isValid = false;
      errors.username = "Username is required!";
    }
    if (!req.body.password) {
      isValid = false;
      errors.password = "Password is required!";
    }

    if (isValid) {
      next();
    } else {
      req.flash("errors", errors);
      res.redirect("/signin");
    }
  },
  (req, res) => {
    const { username, password } = req.body;

    getToken = getTokenPromise(username, password, "post");

    if (getToken === null) {
      req.flash("errors", {
        login: "The username or password is incoreect.",
      });
      res.redirect("/signin");
    }

    getToken.then((token) => {
      request(
        {
          headers: {
            "x-access-token": token.data,
          },
          url: "http://localhost:4100/api/auth/me",
          json: true,
        },
        (e, r, body) => {
          res.cookie("token", token.data, { maxAge: 60 * 60 * 24 * 1000 });
          res.cookie(
            "userData",
            {
              _id: body.data._id,
              username: body.data.username,
            },
            { maxAge: 60 * 60 * 24 * 1000 }
          );
          res.redirect("/");
        }
      );
    });
  }
);

// logout
homeRouter.get("/signout", (req, res) => {
  res.clearCookie("token");
  res.clearCookie("userData");
  res.redirect("/");
});

module.exports = homeRouter;
