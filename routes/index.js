require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const bcrypt = require("bcryptjs");
const cloudinary = require("cloudinary").v2;
const nodemailer = require("nodemailer");
const path = require("path");
const router = express.Router();

// require models
require("../models/user");
require("../models/room");
require("../models/book");
const Hostel = mongoose.model("user");
const Room = mongoose.model("room");
const Book = mongoose.model("book");

// multer
const { multerDestination, multerDiskstorage } = require("../helpers/helpers");
// cloudinary
const { cloudinaryConfig } = require("../config/cloudinary");
cloudinaryConfig;

router.get("/", (req, res) => {
  res.render("index/index", { path: req.path });
});

router.get("/hb/register", (req, res) => {
  res.render("index/register", { path: req.path });
});

router.get("/hb/login", (req, res) => {
  res.render("index/login", { path: req.path });
});

// view hostels in a particular locality
router.get("/hb/locality-hostels/:location", (req, res) => {
  Hostel.find({ location: req.params.location })
    .then((hostel) => {
      res.render("index/locality-hostels", {
        hostel,
        location: req.params.location,
        path: req.path,
      });
    })
    .catch((err) => {
      res.render("helpers/errors", { msg: "Hostel in locality not found" });
    });
});

// view a particular hostel
router.get("/hb/view-hostel/:_id", (req, res) => {
  Room.find({ hostel: req.params._id })
    .populate({
      path: "hostel",
      select: "name location",
    })
    .then((room) => {
      if (room) {
        let user = room.filter((x) => x.hostel.name)[0];
        res.render("index/view-hostel", {
          room,
          user: user.hostel,
          path: req.path,
        });
      } else {
        res.render("helpers/errors", { msg: "No Room Registered Yet." });
      }
    })
    .catch((err) =>
      res.render("helpers/errors", { msg: "No Rooms Registered Yet." })
    );
});

router.get("/hb/view-room/:_id", (req, res) => {
  Room.findOne({ _id: req.params._id })
    .populate({
      path: "hostel",
      select: "name location mainImage",
    })
    .then((room) => {
      res.render("index/view-room", { room, path: req.path });
    })
    .catch((err) =>
      res.render("helpers/errors", { msg: "Error viewing room. Try again" })
    );
});

// Register Hostel @ /hb/register
const eagerOptions = { eager: [{ quality: 50 }] };
router.post(
  "/hb/register",
  multerDestination("./hostel-images").single("main-image"),
  (req, res) => {
    const { name, email, phone, location, description, password } = req.body;
    let errors = [];

    if (password.length <= 6) {
      errors.push({ msg: "Password should be more than 6 chars" });
    }
    if (errors.length > 0) {
      res.render("index/register", { errors });
    }

    Hostel.findOne({ name }).then((hostel) => {
      let errors = [];
      if (hostel) {
        errors.push({ msg: "Hostel already exists" });
        res.render("index/register", { errors });
      } else {
        const newHostel = {
          name,
          email,
          phone,
          location,
          description,
          password,
        };

        cloudinary.uploader.upload(
          req.file.path,
          eagerOptions,
          (err, result) => {
            if (err) {
              req.flash("error_msg", "Failed to upload photo. Try again");
              res.redirect("/hb/register");
            } else {
              // hash password
              bcrypt.genSalt(10, (err, salt) => {
                if (err) {
                  req.flash("error_msg", "Something bad happened. Try again");
                  res.redirect("/hb/register");
                } else {
                  bcrypt.hash(newHostel.password, salt, (err, hash) => {
                    if (err) {
                      req.flash(
                        "error_msg",
                        "Something bad happened. Try again"
                      );
                      res.redirect("/hb/register");
                    } else {
                      newHostel.password = hash;
                      newHostel.mainImage = result.eager[0].secure_url;
                      new Hostel(newHostel)
                        .save()
                        .then((hostel) => {
                          req.flash(
                            "success_msg",
                            "Hostel has been added. Login in to dashboard"
                          );
                          res.redirect("/hb/login");
                        })
                        .catch((err) => {
                          req.flash(
                            "error_msg",
                            "Hostel was not added. Check inputs"
                          );
                          res.redirect("/hb/register");
                        });
                    }
                  });
                }
              });
            }
          }
        );
      }
    });
  }
);

// Book a room
router.post(
  "/hb/book-room/:_id",
  multerDestination("./uploads/passport_img").single("profile_img"),
  (req, res) => {
    const {
      name,
      email,
      contact,
      roomType,
      expectations,
      hostel_id,
      room_id,
      hostel_name,
      hostel_email,
      price,
      sex,
    } = req.body;
    const newBooking = {
      name,
      email,
      contact,
      roomType,
      expectations,
      sex,
      room: room_id,
      hostel: hostel_id,
    };
    cloudinary.uploader.upload(req.file.path, eagerOptions, (err, result) => {
      if (err) {
        console.log(err.message);
      } else {
        newBooking.passport_img = result.eager[0].secure_url;
      }
      Book.findOne({ email, hostel: hostel_id }).then((booked) => {
        if (!booked) {
          new Book(newBooking)
            .save()
            .then((book) => {
              console.log(book);
              const output = `
                <p class='text-success'>Room Has been booked</p>
                <p>Your request to book a room has been made.</p>
                <p>Hostel: <strong>${hostel_name}</p></strong></p>
                <p>Room Type Selected : <strong>${book.roomType}</strong></p>
                <p>Price :ghs <span><strong>${price}<strong></span></p>
                <p>You Booked a room with <strong>${hostel_name}</strong> on ${book.date}. </p>
                <p>${hostel_name}'s management will get back to you soon. Thank You</p>
                `;
              let bookOutput = `
              <p class='text-success'>Booking has been made</p>
              <h3>DETAILS</h3>
              <p>Booked By: <strong>${name}</p></strong>
              <p>Room Type : <strong>${roomType} </p></strong>
              <p>Email : <strong>${email} </p></strong>
              <p>Phone : <strong>${contact} </p><strong>
              <p>Sex : <strong>${sex} </p><strong>
              <p>Expectations : <strong>${expectations} </p><strong>
              <hr>
              Go to your dashboard for more info <a href=${"https://asktheporter.herokuapp.com/hb/login"}>Go to dashboard</a>
              `;
              let transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                  user: process.env.NODEMAILER_EMAIL,
                  pass: process.env.NODEMAILER_PASSWORD,
                },
                tls: {
                  rejectUnauthorized: false,
                },
              });

              let mailOptions = {
                from: "asktheporter.co ",
                to: `<${book.email}>`,
                subject: "Hostel Has Been Booked",
                html: output,
              };

              let mailToHostel = {
                from: "asktheporter.co",
                to: `<${hostel_email}>`,
                subject: "Booking Has Been Made",
                html: bookOutput,
              };

              transporter.sendMail(mailToHostel, function (err, data) {
                if (err) {
                  console.log(err);
                } else {
                  console.log("email has been sent");
                }
              });
              transporter.sendMail(mailOptions, function (err, data) {
                if (err) {
                  console.log(err);
                } else {
                  console.log("email has been sent to hostel");
                }
              });

              req.flash(
                "success_msg",
                "Booking made. We will get back to you soon"
              );
              res.redirect(`/hb/view-room/${req.params._id}`);
            })
            .catch((err) => {
              req.flash("error_msg", "Something bad happened,try again");
              res.redirect(`/hb/view-room/${req.params._id}`);
            });
        } else {
          req.flash("error_msg", "You've booked a room in this hostel already");
          res.redirect(`/hb/view-room/${req.params._id}`);
        }
      });
    });
  }
);

// Hostel Login
router.post("/hb/login", (req, res, next) => {
  passport.authenticate("local", {
    failureRedirect: "/hb/login",
    successRedirect: "/hb/dashboard",
    failureFlash: true,
  })(req, res, next);
});

router.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/hb/login");
});

module.exports = router;
