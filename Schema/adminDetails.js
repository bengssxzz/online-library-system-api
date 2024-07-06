const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema({
    email: String,
    password: String,
})

const pdf = mongoose.model("admin", schema);