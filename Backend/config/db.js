require("dotenv").config();
const mongoose = require("mongoose");

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Database Connected");
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
}

module.exports = connectDB;