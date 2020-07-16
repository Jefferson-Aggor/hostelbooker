const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const roomSchema = new Schema({
  hostel: {
    type: Schema.Types.ObjectId,
    ref: "user",
  },
  room: {
    type: String,
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  mainRoomImage: {
    type: String,
    required: true
  },
  // photo_1: {
  //   type: String,
  // },
  // photo_2: {
  //   type: String,
  // },
  // photo_3: {
  //   type: String,
  // },
  bathroomInside: { type: Boolean },
  ac: { type: Boolean },
  porch: { type: Boolean },
  kitchen: { type: Boolean },
  wardrobe: { type: Boolean },
  mono_beds: { type: Boolean },
  date: {
    type: Date,
    default: Date.now,
  },
});

mongoose.model("room", roomSchema);
