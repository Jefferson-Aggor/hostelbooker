const requireLogin = function (req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    req.flash("error_msg", "Please Login first");
    res.redirect("/hb/login");
  }
};

module.exports = requireLogin;
