const mongoose = require("mongoose");

async function connectDB() {
    try {
        await mongoose.connect("mongodb://localhost:27017/roasthire");
        console.log("Database Connected");
    } catch (error) {
        console.error(error);
        
    }
}
module.exports = connectDB;