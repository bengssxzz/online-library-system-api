const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PdfSchema = new Schema({
  title: String, // String is shorthand for {type: String}
  author: String,
  year: Number,
  category: String,
  comments: String,
  destination: String,
});

const pdf = mongoose.model("PdfDetails", PdfSchema);