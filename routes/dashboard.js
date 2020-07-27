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
const { cloudinaryConfig } = require("../config/cloudinary");
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
          res.render("dashboard/dashboard", {
            loggedUser: req.user,
            room,
            book,
            path: req.originalUrl,
          });
        });
    })
    .catch((err) =>
      res.render("helpers/errors", {
        msg: "Oops. Bad network connection. Try again",
      })
    );
});

// get all bookings
router.get("/all-bookings/:_id", requireLogin, (req, res) => {
  Book.find({ hostel: req.params._id })
    .sort({ _id: -1 })
    .then((book) => {
      res.render("dashboard/all-bookings", { book, loggedUser: req.user });
    })
    .catch((err) => {
      res.render("helpers/errors", {
        msg: "Could not load all bookings. Try again",
      });
    });
});

// get room edit route;
router.get("/edit/:_id", requireLogin, (req, res) => {
  Room.findOne({ _id: req.params._id })
    .populate("hostel")
    .then((room) => {
      res.render("dashboard/edit", { room, path: req.path });
    })
    .catch((err) => {
      res.render("helpers/errors", {
        msg: "Sorry, Something bad happened. Try again",
      });
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
        req.flash("error_msg", "Failed to upload photo. Try again");
        res.redirect("/hb/dashboard");
      } else {
        const newRoom = {
          room,
          price,
          description,
          porch: validateCheckbox(porch, "on"),
          wardrobe: validateCheckbox(wardrobe, "on"),
          mono_beds: validateCheckbox(monoBeds, "on"),
          bathroomInside: validateCheckbox(bathroom, "on"),
          ac: validateCheckbox(ac, "on"),
          kitchen: validateCheckbox(kitchen, "on"),
          mainRoomImage: result.eager[0].secure_url,
          hostel: req.user._id,
        };
        new Room(newRoom)
          .save()
          .then((room) => {
            req.flash("success_msg", "Room added !!");
            res.redirect("/hb/dashboard");
          })
          .catch((err) => {
            req.flash("error_msg", "Room not added!!");
            res.redirect("/hb/dashboard");
          });
      }
    });
  }
);

// edit room
router.put(
  "/edit/:_id",
  requireLogin,
  multerDestination("./room-images/edited").single("image"),
  (req, res) => {
    Room.findOne({ _id: req.params._id }).then((room) => {
      if (req.file) {
        cloudinary.uploader.upload(
          req.file.path,
          eagerOptions,
          (error, result) => {
            if (error) {
              req.flash("error_msg", "Something bad happened. Try again");
              res.redirect(`/hb/dashboard/edit/${req.params._id}`);
            } else {
              (room.room = req.body.room),
                (room.price = req.body.price),
                (room.description = req.body.description),
                (room.porch = validateCheckbox(req.body.porch, "on")),
                (room.wardrobe = validateCheckbox(req.body.wardrobe, "on")),
                (room.ac = validateCheckbox(req.body.ac, "on")),
                (room.mono_beds = validateCheckbox(req.body.monoBeds, "on")),
                (room.bathroomInside = validateCheckbox(
                  req.body.bathroom,
                  "on"
                )),
                (room.kitchen = validateCheckbox(req.body.kitchen, "on")),
                (room.mainRoomImage = result.eager[0].secure_url);

              room
                .save()
                .then((editted) => {
                  req.flash(
                    "success_msg",
                    "Room has been updated. Back to dashboard"
                  );
                  res.redirect(`/hb/dashboard/`);
                })
                .catch((err) => {
                  req.flash("error_msg", "Something bad happened. Try again");
                  res.redirect(`/hb/dashboard/edit/${req.params._id}`);
                });
            }
          }
        );
      } else {
        (room.room = req.body.room),
          (room.price = req.body.price),
          (room.description = req.body.description),
          (room.porch = validateCheckbox(req.body.porch, "on")),
          (room.wardrobe = validateCheckbox(req.body.wardrobe, "on")),
          (room.ac = validateCheckbox(req.body.ac, "on")),
          (room.mono_beds = validateCheckbox(req.body.monoBeds, "on")),
          (room.bathroomInside = validateCheckbox(req.body.bathroom, "on")),
          (room.kitchen = validateCheckbox(req.body.kitchen, "on")),
          room
            .save()
            .then((editted) => {
              req.flash(
                "success_msg",
                "Room has been updated. Back to dashboard"
              );
              res.redirect(`/hb/dashboard/`);
            })
            .catch((err) => {
              req.flash("error_msg", "Something bad happened. Try again");
              res.redirect(`/hb/dashboard/edit/${req.params._id}`);
            });
      }
    });
  }
);

// delete room;
router.delete("/delete/:_id", (req, res) => {
  Room.deleteOne({ _id: req.params._id })
    .then((deleted) => {
      req.flash("success_msg", "Room Deleted !");
      res.redirect(`/hb/dashboard`);
    })
    .catch((err) => {
      res.render("helpers/error", { msg: "Could not delete room. Try again" });
      req.flash("error_msg", "Something bad happened. Try again");
      res.redirect("/hb/dashboard");
    });
});

module.exports = router;
