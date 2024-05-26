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

// delete room by admin 
router.delete("/delete/:id", async (req, res) => {
    if (req.params.id) {
        try {
            await Room.findByIdAndDelete(req.params.id)
            res.status(200).json("Room has been delete successfully !!")
        } catch (err) {
            console.error("Error occurred during delete room:", err);
            res.status(500).send("An error occurred during deleting room. Please try again !!");
        }
    }
    else {
        console.error("Error occurred during delete room:", err);
        res.status(500).send("Not getting the room Id. Please try again !!");
    }
})


//edit the room details 
router.put("/update", async (req, res) => {
    if (req.body.roomId) {
        try {

            const updatedRoom = await Room.findByIdAndUpdate(req.body.roomId,
                {
                    $set: req.body
                },
                { new: true })
            res.status(200).json(updatedRoom)
        } catch (err) {
            console.error("Error occurred during updateing room:", err);
            res.status(500).send("Getting error during updating room details. Please try again !!");
        }
    }
    else {
        console.error("Error occurred during updateing room:", err);
        res.status(500).send("Not getting all the room details for upadte room. Please try again !!");
    }
})

//room reviews ---:
router.post("/addreview", async (req, res) => {
    const { roomid, review } = req.body;
    console.log("review data in server ---:", req.body);
  
    try {
      const room = await Room.findById(roomid);
      if (!room) {
        return res.status(404).send("Room not found");
      }
  
      room.reviews.push(review);
      await room.save();
  
      res.status(200).json(room);
    } catch (error) {
      console.error("Error occurred during add review:", error);
      res.status(500).send("An error occurred while adding the review. Please try again later.");
    }
  });


module.exports = router;

