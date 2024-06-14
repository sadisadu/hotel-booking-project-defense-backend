const express = require("express");
const connectDB = require("./db.js")
const app = express();
const cors = require('cors')



app.use(cors({
  origin: "*",
  credentials: true
}))

app.use(express.json());
const roomsRoute = require('./routes/roomsRoute.js')
const usersRoute = require('./routes/usersRoute.js')
const bookingRoute = require('./routes/bookingRoute.js')

app.use('/api/rooms', roomsRoute)
app.use('/api/users', usersRoute)
app.use('/api/bookings', bookingRoute)



// const PORT = process.env.PORT || 7700;
// app.listen(7700, () => {
//   console.log(`Server running on port ${PORT}`);
// });

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
