const express = require('express');
const router = express.Router();

const Room = require('../models/rooms')

router.get("/getallrooms", async (req, res) => {

    try {
        const rooms = await Room.find({})
        res.send(rooms)
    } catch (error) {
        console.error("Error occurred during all rooms:", error);
        res
            .status(500)
            .send("An error occurred during all rooms. Please try again later.");
    }
});

// get room by id
router.post("/getroombyid", async (req, res) => {
    const roomid = req.body.roomid;
    try {
        const room = await Room.findOne({ _id: roomid });
        res.send(room);
    } catch (error) {
        console.error("Error occurred during roombyid:", error);
        res
            .status(500)
            .send("An error occurred during roombuid. Please try again later.");
    }
});


// add room
router.post("/addRoom", async (req, res) => {
    const roomid = req.body.roomid;
    try {
        const newRoom = new Room(req.body)
        await newRoom.save()
        res.send("New Room Added Succesfully");
    } catch (error) {
        console.error("Error occurred during add room:", error);
        res.status(500).send("An error occurred during add room. Please try again later.");
    }
});

module.exports = router;

