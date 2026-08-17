const mongoose = require("mongoose");
const userSchema = mongoose.Schema({
    name : {
        required : true,
        type : String,
        timestamps : true
    },
    email : {
        unique : true,
        required : true,
        type : String,
        timestamps : true
    },
    password : {
        required : true,
        type : String,
        minlength : 8,
        timestamps : true
    }
});
const user = mongoose.model("User", userSchema);
module.exports = user;