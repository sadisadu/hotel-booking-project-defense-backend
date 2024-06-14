const SSLCommerzPayment = require('sslcommerz-lts')
const express = require("express");
const router = express.Router();
const cron = require('node-cron');
const Booking = require("../models/booking.js");
const Room = require("../models/rooms.js");
const User = require("../models/user.js");
const Notification = require("../models/notification.js");
const moment = require("moment");
const { v4: uuidv4 } = require("uuid");
const stripe = require("stripe")(
  "sk_test_51PFdpZRoGuoCEYvazqOeiKkDNaR6fkntQmcyKLVi6JaEDEJTT2iMyRgA9YCrXvAQvznRfEfo4yumukX0ZGz6sBJK00zluBospO"
);


// check availability
async function checkAvailability(roomid, fromdate, todate) {
  // console.log("roomid", roomid)
  // console.log("fromdate", fromdate)
  // console.log("todate", todate)
  const bookings = await Booking.find({
    roomid: roomid,
    $or: [
      { fromdate: { $lte: todate }, todate: { $gte: fromdate } }
    ]
  });
  const room = await Room.findById(roomid);
  const bookedRooms = bookings.length;
  const availableRooms = room.totalrooms - bookedRooms;
  return availableRooms;
}
// bookroom
router.post("/bookroom", async (req, res) => {
  const { room, userid, Fromdate, Todate, totalamount, totaldays, token } =
    req.body;
  const availableRooms = await checkAvailability(room?._id, Fromdate, Todate);
  console.log("available", availableRooms)
  if (availableRooms > 0) {
    try {
      // console.log("I am token", token)
      const customer = await stripe.customers.create({
        email: token.email,
        source: token.id,
      });
      const payment = await stripe.charges.create(
        {
          amount: totalamount * 100,
          customer: customer.id,
          currency: "BDT",
          receipt_email: token.email,
        },
        {
          idempotencyKey: uuidv4(),
        }
      );
      if (payment) {
        const newbooking = new Booking({
          room: room.name,
          roomid: room._id,
          userid,
          fromdate: moment(Fromdate).format("DD-MM-YYYY"),
          todate: moment(Todate).format("DD-MM-YYYY"),
          totalamount,
          totaldays,
          transaction: "1234",
        });
        const booking = await newbooking.save();
        console.log("booking done!");
        const roomtemp = await Room.findOne({ _id: room._id });
        await Room.findByIdAndUpdate(roomtemp._id, { $inc: { totalrooms: -1 } });
        console.log("roomtemp", roomtemp);
        roomtemp.currentbookings.push({
          bookingid: booking._id,
          fromdate: moment(Fromdate).format("DD-MM-YYYY"),
          todate: moment(Todate).format("DD-MM-YYYY"),
          userid: userid,
          status: booking.status,
          reqRefund: false,
          isRefunded: false,
          refundAmount: 0,
        });
        await roomtemp.save();
      }
      res.send("payment Successfull ,Your Room is booked");
    } catch (error) {
      console.error("Error occurred during booking:", error);
      res
        .status(500)
        .send("An error occurred during booking. Please try again later.");
    }
  }
  else {
    res.status(400).json({ message: 'No rooms available for the selected dates' });
  }
});


// automatically free up rooms after booking peroid over
cron.schedule('0 0 * * *', async () => {
  const now = new Date();
  const expiredBookings = await Booking.find({
    todate: { $lt: now },
    status: 'booked'
  });
  for (const booking of expiredBookings) {
    await Room.findByIdAndUpdate(booking.roomid, { $inc: { totalrooms: 1 } });
    booking.status = 'expired';
    await booking.save();
  }
  console.log('Expired bookings processed');
});


// get bookings
router.post("/getbookings", async (req, res) => {
  const userid = req.body.userid;
  try {
    const bookings = await Booking.find({ userid: userid });
    res.send(bookings);
  } catch (error) {
    console.error("Error occurred during booking:", error);
    res
      .status(500)
      .send("An error occurred during booking. Please try again later.");
  }
});

// cancel bookings (by user)
router.post("/cancelBooking", async (req, res) => {
  const { bookingid, roomid } = req.body;
  try {
    const bookingItem = await Booking.findOne({ _id: bookingid });
    bookingItem.status = "cancelled";
    await bookingItem.save();
    await Room.findByIdAndUpdate(roomid, { $inc: { totalrooms: 1 } });
    const room = await Room.findOne({ _id: roomid });
    const bookings = room.currentbookings;
    const tempBookings = bookings.filter(
      (item) => item.bookingid.toString() !== bookingid
    );
    room.currentbookings = tempBookings;
    await room.save();
    res.send("Booking cancelled successfully !!!");
  } catch (error) {
    console.error("Error occurred during canceling booking:", error);
    res
      .status(500)
      .send("An error occurred during cancel booking. Please try again later.");
  }
});

// checkout (by user)
router.post("/checkout", async (req, res) => {
  const { bookingid, roomid } = req.body;
  try {
    const bookingItem = await Booking.findOne({ _id: bookingid });
    bookingItem.status = "checkout";
    await bookingItem.save();
    await Room.findByIdAndUpdate(roomid, { $inc: { totalrooms: 1 } });
    const room = await Room.findOne({ _id: roomid });
    const bookings = room.currentbookings;
    const tempBookings = bookings.filter(
      (item) => item.bookingid.toString() !== bookingid
    );
    room.currentbookings = tempBookings;
    await room.save();
    res.send("Checkout successfully !!!");
  } catch (error) {
    console.error("Error occurred during checkout by user:", error);
    res
      .status(500)
      .send("Error occurred during checkout by user. Please try again later.");
  }
});


// refund bookings (by user)
router.post("/refundBooking", async (req, res) => {
  const { bookingid, roomid } = req.body;
  try {
    const bookingItem = await Booking.findOne({ _id: bookingid });
    bookingItem.reqRefund = true;
    await bookingItem.save();

    await Room.findByIdAndUpdate(roomid, { $inc: { totalrooms: 1 } });

    const room = await Room.findOne({ _id: roomid });
    const bookings = room.currentbookings;
    const tempBookings = bookings.filter(
      (item) => item.bookingid.toString() !== bookingid
    );
    room.currentbookings = tempBookings;
    await room.save();

    res.send("Request for Refund successful !!!");
  } catch (error) {
    console.error("Error occurred during refund booking:", error);
    res
      .status(500)
      .send("An error occurred during refund booking. Please try again later.");
  }
});




//  bookings canceled by admin 
router.post("/admin/cancelBooking", async (req, res) => {
  const { bookingid, roomid } = req.body;
  try {
    const bookingItem = await Booking.findOne({ _id: bookingid });
    bookingItem.status = "cancelled";
    await bookingItem.save();
    await Room.findByIdAndUpdate(roomid, { $inc: { totalrooms: 1 } });
    const room = await Room.findOne({ _id: roomid });
    const bookings = room.currentbookings;
    const tempBookings = bookings.filter(
      (item) => item.bookingid.toString() !== bookingid
    );
    room.currentbookings = tempBookings;
    await room.save();
    const userInfo = await User.findById(bookingItem.userid)
    if (!userInfo) {
      return res.status(404).send("User not found !!!");
    }
    //create a notification
    const notification = new Notification({
      userid: userInfo._id,
      message: `Your booking on ${bookingItem.room} from ${bookingItem.fromdate} to ${bookingItem.todate} has been cancelled by the admin.`
    });
    await notification.save();
    console.log("Notification created !!!")
    res.send("Booking cancelled successfully !!!");
  } catch (error) {
    console.error("Error occurred during canceling booking:", error);
    res
      .status(500)
      .send("An error occurred during cancel booking. Please try again later.");
  }
});

// checkout by admin 
router.post("/admin/checkout", async (req, res) => {
  const { bookingid, roomid } = req.body;
  try {
    const bookingItem = await Booking.findOne({ _id: bookingid });
    bookingItem.status = "checkout";
    await bookingItem.save();
    await Room.findByIdAndUpdate(roomid, { $inc: { totalrooms: 1 } });
    const room = await Room.findOne({ _id: roomid });
    const bookings = room.currentbookings;
    const tempBookings = bookings.filter(
      (item) => item.bookingid.toString() !== bookingid
    );
    room.currentbookings = tempBookings;
    await room.save();
    res.send("Checkout successfully !!!");
  } catch (error) {
    console.error("Error occurred during checkout by admin:", error);
    res
      .status(500)
      .send("Error occurred during checkout by admin. Please try again later.");
  }
});


//  refund  by admin 
router.post("/admin/makeRefund", async (req, res) => {
  const { bookingid, roomid } = req.body;
  try {
    const bookingItem = await Booking.findOne({ _id: bookingid });
    bookingItem.isRefunded = true;
    await bookingItem.save();

    await Room.findByIdAndUpdate(roomid, { $inc: { totalrooms: 1 } });

    const room = await Room.findOne({ _id: roomid });
    const bookings = room.currentbookings;
    const tempBookings = bookings.filter(
      (item) => item.bookingid.toString() !== bookingid
    );
    room.currentbookings = tempBookings;
    await room.save();

    const userInfo = await User.findById(bookingItem.userid)
    if (!userInfo) {
      return res.status(404).send("User not found !!!");
    }

    //create a notification
    const notification = new Notification({
      userid: userInfo._id,
      message: `Your refund on ${bookingItem.room} from ${bookingItem.fromdate} to ${bookingItem.todate} has been made by the admin.`
    });
    await notification.save();

    console.log("Notification created !!!")
    res.send("Your Refund request is granted !!!");
  } catch (error) {
    console.error("Error occurred during refund:", error);
    res
      .status(500)
      .send("An error occurred during refund. Please try again later.");
  }
});


//get all notifications
router.get('/notifications/:userid', async (req, res) => {
  const { userid } = req.params;
  try {
    const notifications = await Notification.find({ userid }).sort({ createdAt: -1 });
    console.log(notifications)
    res.send(notifications);
  } catch (error) {
    res.status(500).send("Server error on all notification !!!");
  }
});

// get all bookings
router.get("/getAllBookings", async (req, res) => {
  try {
    const bookings = await Booking.find({});
    res.send(bookings);
  } catch (error) {
    console.error("Error occurred during booking:", error);
    res
      .status(500)
      .send("An error occurred during booking. Please try again later.");
  }
});


// report
router.get("/getAllBookings", async (req, res) => {
  try {
    const bookings = await Booking.find({});
    res.send(bookings);
  } catch (error) {
    console.error("Error occurred during fetching all bookings:", error);
    res.status(500).send("An error occurred during fetching all bookings. Please try again later.");
  }
});

// Route to get bookings by date range
router.get("/getBookingsByDateRange", async (req, res) => {
  const { startDate, endDate } = req.query;
  try {
    const bookings = await Booking.find({
      fromdate: { $gte: moment(startDate, "YYYY-MM-DD").format("DD-MM-YYYY") },
      todate: { $lte: moment(endDate, "YYYY-MM-DD").format("DD-MM-YYYY") },
    });
    res.send(bookings);
  } catch (error) {
    console.error("Error occurred during fetching bookings by date range:", error);
    res.status(500).send("An error occurred during fetching bookings by date range. Please try again later.");
  }
});

module.exports = router;