// const express = require("express");
const express = require("express");
const router = express.Router();
const Booking = require("../models/booking");
const moment =require("moment");
const stripe =require ('stripe')('sk_test_51PFdpZRoGuoCEYvazqOeiKkDNaR6fkntQmcyKLVi6JaEDEJTT2iMyRgA9YCrXvAQvznRfEfo4yumukX0ZGz6sBJK00zluBospO')

router.post("/bookroom",async(req,res)=>{
    const {
        room,
        userid,
        fromdate,
        todate,
        totalamount,
        totaldays,
         token 
        }=req.body;


        try{

            const customer =await stripe.customers.create({
                email : token.email,
                source: token.id
            })

            const payment =await stripe.changes.create(
                {
                    amount: totalamount*100,
                    customer:customer.id,
                    currency:'taka',
                    receipt_email: token.email
                },{
                    idempotencyKey: uuidv4()
                }
            )

                if(payment){
                    
                        const newbooking = new Booking({
                            room: room.name,
                            roomid:room._id,
                            userid,
                            fromdate:moment(fromdate).format('DD-MM-YYYY'),
                            todate:moment(todate).format('DD-MM-YYYY'),
                            totalamount,
                            totaldays,
                            transactionId :'1234'
                        });
            
                        const booking = await newbooking.save();
            
                        const roomtemp = await room.findOne({_id: room._id});
            
                        roomtemp.currentbookings.push({
                            bookingid: booking._id,
                            fromdate:moment(fromdate).format('DD-MM-YYYY'),
                            todate:moment(todate).format('DD-MM-YYYY'),
                            userid: userid,
                            status:booking.status,
                        });
                        await roomtemp.save();
                        res.send("Room Booked Successfully")
            
                   
                }



            res.send('payment Successfull ,Your Room is booked')
        } catch (error){
                return res.status(400).json({error});
        }












       
});

module.exports = router