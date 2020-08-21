// util.js

let util = {};

// parseError function
util.parseError = function (errors) {
  var parsed = {};
  if (errors.name == "ValidationError") {
    for (var name in errors.errors) {
      var validationError = errors.errors[name];
      parsed[name] = { message: validationError.message };
    }
  } else if (errors.code == "11000" && errors.errmsg.indexOf("username") > 0) {
    parsed.username = { message: "This username already exists!" };
  } else {
    parsed.unhandled = JSON.stringify(errors);
  }
  return parsed;
};

util.noPermission = (req, res) => {
  req.flash("errors", { login: "You don't have permission!" });
  res.clearCookie("token");
  res.clearCookie("userData");
  res.redirect("/signin");
};

export default util;
