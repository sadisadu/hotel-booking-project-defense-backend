const mongoose = require("mongoose");



// const reviewSchema = new mongoose.Schema();


const roomSchema = mongoose.Schema({

    name: {
        type: String,
        require: true
    },
    totalrooms: {
        type: Number,
        require: true
    },
    phonenumber: {
        type: Number,
        require: true
    },
    rentperday: {
        type: Number,
        require: true
    },
    imageurls: [],
    currentbookings: [],
    type: {
        type: String,
        require: true
    },
    location: {
        type: String,
        require: true
    },
    description: {
        type: String,
        require: true
    },
    reviews: [{
        customerName: { type: String, required: true },
        rating: { type: Number },
        comment: { type: String },
        date: { type: Date, default: Date.now }
      }]


}, {
    timestamps: true,
})

const roomModel = mongoose.model('rooms', roomSchema)


module.exports = roomModel