const express = require("express");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
const router = express.Router();

// require models
require("../models/room");
require("../models/book");
const Room = mongoose.model("room");
const Book = mongoose.model("book");
// require files
const validateCheckbox = require("../helpers/checkboxValidation");
const { multerDestination } = require("../helpers/helpers");
const { cloudinaryConfig, imageFieldChecker } = require("../config/cloudinary");
cloudinaryConfig;

const requireLogin = require("../config/requireLogin");

router.get("/", requireLogin, (req, res) => {
  Room.find({ hostel: req.user._id })
    .populate("user")
    .sort({ _id: -1 })
    .then((room) => {
      Book.find({ hostel: req.user._id })
        .limit(3)
        .sort({ _id: -1 })
        .then((book) => {
          res.render("dashboard/dashboard", { user: req.user, room, book });
        });
    })
    .catch((err) => console.log(err.message));
});

// get room edit route;
router.get("/edit/:_id", requireLogin, (req, res) => {
  Room.findOne({ _id: req.params._id })
    .then((room) => {
      res.send(room);
    })
    .catch((err) => {
      res.send(err);
    });
});

const eagerOptions = { eager: [{ quality: 60 }] };
// post room
router.post(
  "/rooms",
  multerDestination("./room-images").single("image"),
  (req, res) => {
    const {
      room,
      price,
      description,
      bathroom,
      kitchen,
      ac,
      porch,
      wardrobe,
      monoBeds,
    } = req.body;

    // set image to cloudinary
    cloudinary.uploader.upload(req.file.path, eagerOptions, (err, result) => {
      if (err) {
        console.log(err);
      } else {
        const newRoom = {
          room,
          price,
          description,
          porch: validateCheckbox(porch, "on"),
          wardrobe: validateCheckbox(wardrobe, "on"),
          monoBeds: validateCheckbox(monoBeds, "on"),
          bathroomInside: validateCheckbox(bathroom, "on"),
          ac: validateCheckbox(ac, "on"),
          kitchen: validateCheckbox(kitchen, "on"),
          mainRoomImage: result.eager[0].secure_url,
          hostel: req.user._id,
        };
        new Room(newRoom)
          .save()
          .then((room) => {
            console.log(room);
            req.flash("success_msg", "Room added !!");
            res.redirect("/hb/dashboard");
          })
          .catch((err) => {
            req.flash("error_msg", "Room not added!!");
            res.redirect("/hb/dashboard");
            console.log(err);
          });
      }
    });
  }
);

module.exports = router;
