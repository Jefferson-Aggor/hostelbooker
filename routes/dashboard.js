const express = require("express");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
const router = express.Router();

// require models
require("../models/room");
require("../models/book");

const Room = mongoose.model("room");
const Book = mongoose.model("book");
const Hostel = mongoose.model("user");

// require files
const validateCheckbox = require("../helpers/checkboxValidation");
const { multerDestination, multerDiskstorage } = require("../helpers/helpers");
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

const eagerOptions = { eager: [{ quality: 50 }] };
// post room
router.post(
  "/rooms",
  multerDestination("./uploads/room-images").array("image"),
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
      hostel: req.user._id,
    };
    async function saveImages() {
      if (req.files[0]) {
        await cloudinary.uploader.upload(
          req.files[0].path,
          eagerOptions,
          (err, result) => {
            if (err) {
              console.log(err);
            } else {
              newRoom.mainRoomImage = result.eager[0].secure_url;
              console.log(result.eager[0].secure_url);
            }
          }
        );
      }
      if (req.files[1]) {
        await cloudinary.uploader.upload(
          req.files[1].path,
          eagerOptions,
          (err, result) => {
            if (err) {
              console.log(err);
            } else {
              newRoom.photo_1 = result.eager[0].secure_url;
            }
          }
        );
      }
      if (req.files[2]) {
        await cloudinary.uploader.upload(
          req.files[2].path,
          eagerOptions,
          (err, result) => {
            if (err) {
              console.log(err);
            } else {
              newRoom.photo_2 = result.eager[0].secure_url;
            }
          }
        );
      }
      if (req.files[3]) {
        await cloudinary.uploader.upload(
          req.files[3].path,
          eagerOptions,
          (err, result) => {
            if (err) {
              console.log(err);
            } else {
              newRoom.photo_3 = result.eager[0].secure_url;
            }
          }
        );
      }
      if (req.files[4]) {
        await cloudinary.uploader.upload(
          req.files[4].path,
          eagerOptions,
          (err, result) => {
            if (err) {
              console.log(err);
            } else {
              newRoom.photo_4 = result.eager[0].secure_url;
            }
          }
        );
      }
    }

    saveImages().then((images) => {
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
    });
  }
);

// edit room
router.put(
  "/edit/:_id",
  requireLogin,
  multerDestination("./uploads/room-images").array("image"),
  (req, res) => {
    Room.findOne({ _id: req.params._id }).then((room) => {
      (room.room = req.body.room),
        (room.price = req.body.price),
        (room.description = req.body.description),
        (room.porch = validateCheckbox(req.body.porch, "on")),
        (room.wardrobe = validateCheckbox(req.body.wardrobe, "on")),
        (room.ac = validateCheckbox(req.body.ac, "on")),
        (room.mono_beds = validateCheckbox(req.body.monoBeds, "on")),
        (room.bathroomInside = validateCheckbox(req.body.bathroom, "on")),
        (room.kitchen = validateCheckbox(req.body.kitchen, "on"));
      async function saveImages() {
        if (req.files[0]) {
          await cloudinary.uploader.upload(
            req.files[0].path,
            eagerOptions,
            (err, result) => {
              if (err) {
                console.log(err);
              } else {
                room.mainRoomImage = result.eager[0].secure_url;
              }
            }
          );
        }
        if (req.files[1]) {
          await cloudinary.uploader.upload(
            req.files[1].path,
            eagerOptions,
            (err, result) => {
              if (err) {
                console.log(err);
              } else {
                room.photo_1 = result.eager[0].secure_url;
              }
            }
          );
        }
        if (req.files[2]) {
          await cloudinary.uploader.upload(
            req.files[2].path,
            eagerOptions,
            (err, result) => {
              if (err) {
                console.log(err);
              } else {
                room.photo_2 = result.eager[0].secure_url;
              }
            }
          );
        }
        if (req.files[3]) {
          await cloudinary.uploader.upload(
            req.files[3].path,
            eagerOptions,
            (err, result) => {
              if (err) {
                console.log(err);
              } else {
                room.photo_3 = result.eager[0].secure_url;
              }
            }
          );
        }
        if (req.files[4]) {
          await cloudinary.uploader.upload(
            req.files[4].path,
            eagerOptions,
            (err, result) => {
              if (err) {
                console.log(err);
              } else {
                room.photo_4 = result.eager[0].secure_url;
              }
            }
          );
        }
      }

      saveImages().then((images) => {
        room
          .save()
          .then((editted) => {
            console.log(editted);
            req.flash("success_msg", "Room has been updated.");
            res.redirect(`/hb/dashboard/`);
          })
          .catch((err) => {
            console.log(err);
            req.flash("error_msg", "Something bad happened. Try again");
            res.redirect(`/hb/dashboard/edit/${req.params._id}`);
          });
      });
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
      req.flash("error_msg", "Something bad happened. Try again");
      res.redirect("/hb/dashboard");
    });
});
// delete hostel;
router.delete("/delete-hostel/:_id", async (req, res) => {
  try {
    const hostel = await Hostel.findOne({ _id: req.params._id });

    if (!hostel) {
      return res.render("helpers/errors", { msg: "Hostel not found" });
    }

    hostel.remove();
    req.flash("success_msg", "Hostel has been deleted");
    res.redirect("/hb/register");
  } catch (err) {
    req.flash("error_msg", "Hostel could not be deleted");
    res.redirect("/hb/dashboard");
  }
});

module.exports = router;
