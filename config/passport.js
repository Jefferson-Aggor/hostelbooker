const LocalStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// load the user model
require("../models/user");
const User = mongoose.model("user");

module.exports = function (passport) {
  passport.use(
    new LocalStrategy((name, password, done) => {
      User.findOne({ name: name })
        .then((hostel) => {
          if (!hostel) {
            return done(null, false, { message: "Hostel not found" });
          }

          //   compare password
          bcrypt.compare(password, hostel.password, (err, match) => {
            if (err) throw err;
            if (match) {
              return done(null, hostel);
            } else {
              return done(null, false, { message: "Incorrect password" });
            }
          });
        })
        .catch((err) => {
          console.log(err.message);
          return done(null, false, {
            message: "Something bad occured, Try again",
          });
        });
    })
  );

  passport.serializeUser(function (hostel, done) {
    done(null, hostel.id);
  });

  passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, hostel) {
      done(err, hostel);
    });
  });
};
