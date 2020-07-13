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
  multerDestination(`./room-images`).fields([
    { name: "main-image", maxCount: 1 },
    { name: "photo-1", maxCount: 1 },
    { name: "photo-2", maxCount: 1 },
    { name: "photo-3", maxCount: 1 },
    { name: "photo-4", maxCount: 1 },
  ]),
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

    let newRoom = {
      room,
      price,
      description,
      bathroom: validateCheckbox(bathroom, "on"),
      kitchen: validateCheckbox(kitchen, "on"),
      ac: validateCheckbox(ac, "on"),
      porch: validateCheckbox(porch, "on"),
      wardrobe: validateCheckbox(wardrobe, "on"),
      monoBeds: validateCheckbox(monoBeds, "on"),
      hostel: req.user._id,
    };

    let images = [];

    // cloudinary.uploader.upload(req.files['main-image'][0].path,eagerOptions,cb)
    // function cb (err,result){
    //   if(err){
    //     console.log(err)
    //   }else{
    //   return result.eager[0].secureUrls
    //   }
    // }

    new Room(newRoom)
      .save()
      .then((room) => {
        req.flash("success_msg", "Room successfully added");
        res.redirect("/hb/dashboard");
      })
      .catch((err) => {
        console.log(err.message);
        req.flash("error_msg", "Room not added, Try again");
        res.redirect("/hb/dashboard");
      });
  }
);

module.exports = router;
