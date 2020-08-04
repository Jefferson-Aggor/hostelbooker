const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const bookSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  contact: {
    type: String,
    required: true,
  },
  hostel: {
    type: Schema.Types.ObjectId,
    ref: "user",
  },
  room: {
    type: Schema.Types.ObjectId,
    ref: "room",
  },
  roomType: {
    type: String,
    required: true,
  },
  sex: {
    type: String,
    required: true,
  },
  passport_img: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

mongoose.model("book", bookSchema);
