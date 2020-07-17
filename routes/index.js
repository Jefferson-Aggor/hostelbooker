require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const bcrypt = require("bcryptjs");
const cloudinary = require("cloudinary").v2;
const nodemailer = require("nodemailer");
const router = express.Router();

// require models
require("../models/user");
require("../models/room");
require("../models/book");
const Hostel = mongoose.model("user");
const Room = mongoose.model("room");
const Book = mongoose.model("book");

// multer
const { multerDestination } = require("../helpers/helpers");
// cloudinary
const { cloudinaryConfig } = require("../config/cloudinary");
cloudinaryConfig;

router.get("/", (req, res) => {
  res.render("index/index");
});

router.get("/hb/register", (req, res) => {
  res.render("index/register");
});

router.get("/hb/login", (req, res) => {
  res.render("index/login");
});

// view hostels in a particular locality
router.get("/hb/locality-hostels/:location", (req, res) => {
  Hostel.find({ location: req.params.location })
    .then((hostel) => {
      res.render("index/locality-hostels", {
        hostel,
        location: req.params.location,
      });
    })
    .catch((err) => {
      res.render("helpers/errors", { msg: "Hostel in locality not found" });
    });
});

// view a particular hostel
router.get("/hb/view-hostel/:_id", (req, res) => {
  Room.find({ hostel: req.params._id })
    .populate("hostel")
    .then((room) => {
      if (room) {
        let user = room.filter((x) => x.hostel.name)[0];
        res.render("index/view-hostel", { room, user: user.hostel });
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
    .populate("hostel")
    .then((room) => {
      res.render("index/view-room", { room });
    })
    .catch((err) =>
      res.render("helpers/errors", { msg: "Error viewing room. Try again" })
    );
});

// Register Hostel @ /hb/register
const eagerOptions = { eager: [{ quality: 60 }] };
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
              console.log(err);
            } else {
              // hash password
              bcrypt.genSalt(10, (err, salt) => {
                if (err) {
                  console.log(err);
                } else {
                  bcrypt.hash(newHostel.password, salt, (err, hash) => {
                    if (err) {
                      console.log(err);
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
router.post("/hb/book-room/:_id", (req, res) => {
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

  Book.findOne({ name, room: room_id, email }).then((booked) => {
    if (!booked) {
      new Book(newBooking)
        .save()
        .then((book) => {
          const output = `
              <p class='text-success'>Hostel Has been booked</p>
              <p>Your request to book a room has been made.</p>
              <p>Hostel : ${hostel_name}</p>
              <p>Room Type Selected :${book.roomType}</p>
              <p>Price :ghs</p> <h3>${price}</h3>
              <p>You Booked a room with ${hostel_name} on ${book.date}. </p>
              <p>${hostel_name}'s management will get back to you soon. Thank You</p>
              `;
          let bookOutput = `
            <p class='text-success'>Booking has been made</p>
            <h3>DETAILS</h3>
            <p>Booked By: ${name}</p>
            <p>Room Type : ${roomType} </p>
            <p>Email : ${email} </p>
            <p>Phone : ${contact} </p>
            <p>Sex : ${sex} </p>
            <p>Expectations : ${expectations} </p>
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
            from: process.env.NODEMAILER_EMAIL,
            to: `<${book.email}>`,
            subject: "Hostel Has Been Booked",
            html: output,
          };

          let mailToHostel = {
            from: process.env.NODEMAILER_EMAIL,
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
          console.log(err.message);
          res.redirect(`/hb/view-room/${req.params._id}`);
        });
    } else {
      req.flash("error_msg", "You've booked room already");
      res.redirect(`/hb/view-room/${req.params._id}`);
      console.log("booked already");
    }
  });
});

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
