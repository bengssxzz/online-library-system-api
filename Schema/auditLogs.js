const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const logSchema = new Schema({
    action: String,
    date: Date,
})

const pdf = mongoose.model("auditLog", logSchema);