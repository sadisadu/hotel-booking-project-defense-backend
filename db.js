
const mongoose = require("mongoose");


const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`mongodb+srv://sadia:zW3MJLNa9EyV1FGu@cluster0.t20dopv.mongodb.net/hotels-room`)

        console.log(`\n MongoDB connected !! DB Host: ${connectionInstance.connection.host}`)

    } catch (error) {
        console.log("MongoDB connection FAILED ERROR: ", error)
        process.exit(1);
    }
}

module.exports = connectDB