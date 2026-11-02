const mongoose = require("mongoose");
const userSchema = mongoose.Schema({
    role : {
        type : String,
        enum : ["candidate", "hiringTeam", "admin"],
        default : "candidate",
    },
    hiringTeamVerified : {
        type : Boolean,
        default : false,
    },
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