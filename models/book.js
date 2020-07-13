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
  roomType: {
    type: String,
    required:true
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

mongoose.model("book", bookSchema);
