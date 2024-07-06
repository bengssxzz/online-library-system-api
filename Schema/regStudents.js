const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const regSchema = new Schema({
  lrn: String, // String is shorthand for {type: String}
  password: String,
  regDate: Date
});

const credential = mongoose.model("regStudents", regSchema);