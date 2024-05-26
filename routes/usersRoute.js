const express = require("express");
const router = express.Router();
const User = require("../models/user.js")

router.post("/register", async (req, res) => {
    // console.log("i am new user ", newuser)

    try {
        const newuser = new User({ name: req.body.name, email: req.body.email, password: req.body.password })
        await newuser.save()
        res.status(200).send('User Registered Successfully')

    } catch (error) {
        return res.status(400).json({ error });
    }
});

router.post("/login", async (req, res) => {

    const { email, password } = req.body

    try {
        const user = await User.findOne({ email: email, password: password })
        if (user) {
            const temp = {
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                _id: user._id,
            }
            res.send(user)
        }
        else {
            return res.status(400).json({ message: 'Login failed' });
        }
    } catch (error) {
        console.log(error)
        return res.status(400).json({ error });
    }
});

// get all users
router.get("/getallusers", async (req, res) => {

    try {
        const users = await User.find({})
        res.send(users)
    } catch (error) {
        console.error("Error occurred during all users:", error);
        res
            .status(500)
            .send("An error occurred during all users. Please try again later.");
    }
});

// delete user by admin
router.delete("/delete/:id", async (req, res) => {
    if (req.params.id) {
        try {
            await User.findByIdAndDelete(req.params.id)
            res.status(200).json("User has been delete successfully !!")
        } catch (err) {
            console.error("Error occurred during user:", err);
            res.status(500).send("An error occurred during deleting user. Please try again !!");
        }
    }
    else {
        console.error("Error occurred during delete user:", err);
        res.status(500).send("Not getting the user id. Please try again !!");
    }
})


//edit the room details 
router.put("/update", async (req, res) => {
    if (req.body.userId) {
        try {

            const updatedUser = await User.findByIdAndUpdate(req.body.userId,
                {
                    $set: req.body
                },
                { new: true })
            res.status(200).json(updatedUser)
        } catch (err) {
            console.error("Error occurred during updateing user:", err);
            res.status(500).send("Getting error during updating user details. Please try again !!");
        }
    }
    else {
        console.error("Error occurred during updateing user:", err);
        res.status(500).send("Not getting all the room details for upadte user. Please try again !!");
    }
})



module.exports = router