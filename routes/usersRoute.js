const express =require("express");
const router = express.Router();
const User = require("../models/user.js")

router.post("/register",async(req,res)=>{
    // console.log("i am new user ", newuser)
    
    try{
        const newuser =new User({name:req.body.name,email:req.body.email,password:req.body.password})
        await newuser.save()
        res.status(200).send('User Registered Successfully')

    }catch(error){
        return res.status(400).json({error});
    }
});

router.post("/login",async(req,res)=> {

    const {email,password}=req.body

    try{
        const user =await User.findOne({email:email,password:password})
        if(user){
            const temp = {
                name:user.name,
                email:user.email,
                isAdmin: user.isAdmin,
                _id:user._id,
            }
            res.send(user)
        }
        else{
            return res.status(400).json({message:'Login failed'});
        }
    }catch(error){
        console.log(error)
        return res.status(400).json({error});
    }
});

module.exports=router