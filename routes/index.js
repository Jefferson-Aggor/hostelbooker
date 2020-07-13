require('dotenv').config()
const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const bcrypt = require("bcryptjs");
const nodemailer = require('nodemailer')
const router = express.Router();

// require models
require("../models/user");
require("../models/room");
require('../models/book')
const Hostel = mongoose.model("user");
const Room = mongoose.model("room");
const Book = mongoose.model('book')



router.get("/", (req, res) => {
  Hostel.find({})
    .sort({ date: -1 })
    .then((hostels) => {
      let loc = [];
      let locSet = [];
      hostels.map((hostel) => {
        locSet.push(hostel.location);
        loc = [...new Set(locSet)];
        return loc;
      });
      console.log(loc);
      res.render("index/index", { hostels, loc });
    });
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
      res.render("index/locality-hostels", { hostel });
    })
    .catch((err) => {
      res.send("Not found");
    });
});
// view a particular hostel
router.get("/hb/view-hostel/:_id", (req, res) => {
  Room.find({ hostel: req.params._id })
    .populate("hostel")
    .then((room) => {
      let user = room.filter((x) => x.hostel.name)[0];

      res.render("index/view-hostel", { room, user: user.hostel });
    })
    .catch((err) => res.send(err.message));
});

router.get("/hb/view-room/:_id", (req, res) => {
  Room.findOne({ _id: req.params._id })
    .populate("hostel")
    .then((room) => {
      res.render("index/view-room", {room});
    })
    .catch((err) => console.log(err));
});

// Register Hostel @ /hb/register
router.post("/hb/register", (req, res) => {
  const { name, email, phone, location, description, password } = req.body;

  Hostel.findOne({ name }).then((hostel) => {
    let errors = [];

    if (hostel) {
      errors.push({ msg: "Hostel already exists" });
      // res.render('index/index',{errors})
      res.send("hostel already exists");
    } else {
      const newHostel = {
        name,
        email,
        phone,
        location,
        description,
        password,
      };

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
                  res.send("error: couldnt save");
                });
            }
          });
        }
      });
    }
  });
});

// Book a room
router.post('/hb/book-room/:_id',(req,res)=>{
  const {name,email,contact,roomType,expectations,hostel_id,hostel_name} = req.body
  const newBooking =  {
    name,
    email,contact,roomType,expectations, hostel: hostel_id
  }

  new Book(newBooking).save()
  .then((book)=>{
    const output = `
    <p class='text-success'>Hostel Has been booked</p>
    <p>Your details</p>
    <div class='divider'></div>
    <p>Hostel : ${hostel_name}</p>
    <p>${book.roomType}</p>
    `
    let transporter =  nodemailer.createTransport({
      service:'gmail',
      auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASSWORD
      },tls:{
        rejectUnauthorized: false
      }
    })

    let mailOptions = {
      from: process.env.NODEMAILER_EMAIL,
      to: `<${book.email}>`,
      subject: 'Testing',
      text: 'Hello there, im from nodemailer',
      html: output
    }

    transporter.sendMail(mailOptions,function(err,data){
      if(err){
        console.log(err)
      }else{
        console.log('email has been sent')
      }
    })
    

    req.flash('success_msg','Booking made. We will get back to you soon')
    res.redirect(`/hb/view-room/${req.params._id}`)
  })
  .catch(err => {
    req.flash('error_msg','Something bad happened,try again')
    console.log(err.message)
    res.redirect(`/hb/view-room/${req.params._id}`)
  })
 
})

// Hostel Login
router.post("/hb/login", (req, res, next) => {
  passport.authenticate("local", {
    failureRedirect: "/hb/login",
    successRedirect: "/hb/dashboard",
    failureFlash: true,
  })(req, res, next);
});
module.exports = router;
