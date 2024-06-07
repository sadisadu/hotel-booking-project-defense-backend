const mongoose = require("mongoose");

const bookingSchema = mongoose.Schema({
    room: {
        type: String, required: true
    },
    roomid: {
        type: String, required: true
    },
    userid: {
        type: String, required: true
    },
    fromdate: {
        type: String, required: true
    },
    todate: {
        type: String, required: true
    },
    totalamount: {
        type: Number, required: true
    },
    totaldays: {
        type: Number, required: true
    },
    childNumber: {
        type: Number, required: true
    },
    adultNumber: {
        type: Number, required: true
    },
    transaction: {
        type: String, required: true
    },
    status: {
        type: String, required: true, default: 'booked'
    },
    reqRefund :{
        type: Boolean, required: true, default: false
    },
    isRefunded :{
        type: Boolean, required: true, default: false
    },
    refundAmount :{
        type: Number, required: true, default: 0
    },
    
}, {
    timestamps: true,
})

const bookingmodel = mongoose.model('booking', bookingSchema);

module.exports = bookingmodel;