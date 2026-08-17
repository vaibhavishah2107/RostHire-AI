const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware")
const uploadResume = require("../controller/resume.controllers");

router.post("/upload", 
    verifyToken, 
    upload.single("resume"), 
    uploadResume); 
    
module.exports = router;