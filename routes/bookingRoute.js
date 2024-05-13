// const express = require("express");
const express = require("express");
const router = express.Router();
const Booking = require("../models/booking.js");
const Room = require("../models/rooms.js")
const moment = require("moment");
const { v4: uuidv4 } = require('uuid');
const stripe = require('stripe')('sk_test_51PFdpZRoGuoCEYvazqOeiKkDNaR6fkntQmcyKLVi6JaEDEJTT2iMyRgA9YCrXvAQvznRfEfo4yumukX0ZGz6sBJK00zluBospO')

// bookroom
router.post("/bookroom", async (req, res) => {

    const {
        room,
        userid,
        Fromdate,
        Todate,
        totalamount,
        totaldays,
        token
    } = req.body;

    try {
        // console.log("I am token", token)
        const customer = await stripe.customers.create({
            email: token.email,
            source: token.id
        })

        const payment = await stripe.charges.create(
            {
                amount: totalamount * 100,
                customer: customer.id,
                currency: 'BDT',
                receipt_email: token.email
            }, {
            idempotencyKey: uuidv4()
        }
        )


        if (payment) {

            const newbooking = new Booking({
                room: room.name,
                roomid: room._id,
                userid,
                fromdate: moment(Fromdate).format('DD-MM-YYYY'),
                todate: moment(Todate).format('DD-MM-YYYY'),
                totalamount,
                totaldays,
                transaction: '1234'
            });

            const booking = await newbooking.save();
            console.log("booking done!")
            const roomtemp = await Room.findOne({ _id: room._id });
            console.log("roomtemp", roomtemp)


            roomtemp.currentbookings.push({
                bookingid: booking._id,
                fromdate: moment(Fromdate).format('DD-MM-YYYY'),
                todate: moment(Todate).format('DD-MM-YYYY'),
                userid: userid,
                status: booking.status,
            });
            await roomtemp.save();
        }
        res.send('payment Successfull ,Your Room is booked')
    } catch (error) {
        console.error("Error occurred during booking:", error);
        res.status(500).send('An error occurred during booking. Please try again later.');
    }

});

// get bookings
router.post("/getbookings", async (req, res) => {
    const userid = req.body.userid
    try {
        const bookings = await Booking.find({ userid: userid })
        res.send(bookings)

    } catch (error) {
        console.error("Error occurred during booking:", error);
        res.status(500).send('An error occurred during booking. Please try again later.');
    }
})

// cancel bookings
router.post("/cancelBooking", async (req, res) => {
    const { bookingid, roomid } = req.body
    try {
        const bookingItem = await Booking.findOne({ _id: bookingid })
        bookingItem.status = "cancelled"
        await bookingItem.save()
        
        const room = await Room.findOne({ _id: roomid })
        const bookings = room.currentbookings
        const tempBookings = bookings.filter(item => item.bookingid.toString() !== bookingid)
        room.currentbookings = tempBookings
        await room.save()

        res.send("Booking cancelled successfully !!!")

    } catch (error) {
        console.error("Error occurred during booking:", error);
        res.status(500).send('An error occurred during booking. Please try again later.');
    }
})

module.exports = router