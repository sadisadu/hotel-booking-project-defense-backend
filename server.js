const express = require("express");
const connectDB = require("./db.js")
const app = express();
const cors = require('cors')


app.use(cors({
  origin: "*",
  credentials: true
}))

app.use(express.json());
const roomsRoute = require('./routes/roomsRoute')
const usersRoute = require('./routes/usersRoute')
const bookingRoute =require('./routes/bookingRoute')

app.use('/api/rooms', roomsRoute)
app.use('/api/users',usersRoute)
app.use('/api/booking' , bookingRoute)

//* connecting database
connectDB()
  .then(() => {
    app.listen(7700, () => {
      console.log(`⚙️ Server is running at port : 7700`);
    })
  })
  .catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
  })
