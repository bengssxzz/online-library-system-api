const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PdfStat = new Schema({
    title: String,
    view: {
        type: Number,
        default: 0
    },
    download: {
        type: Number,
        default: 0
    }
});

const stats = mongoose.model("pdfstat", PdfStat);