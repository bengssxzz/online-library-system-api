const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const studInfoSchema = new Schema({
  lrn: String, // String is shorthand for {type: String}
  lastname: String,
  firstname: String,
  middlename: String,
});

const information = mongoose.model("studInfo", studInfoSchema);