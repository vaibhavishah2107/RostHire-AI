const dotenv = require("dotenv");

const  connectDB = require("./config/db");
const app = require("./app");
connectDB();
app.listen(3000, ()=>{
    console.log("server started..")
});