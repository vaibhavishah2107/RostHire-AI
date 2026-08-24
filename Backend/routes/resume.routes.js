const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware")
const uploadResume = require("../controller/resume.controllers");
const roastResumeController = require("../controller/roast.controller");

router.post("/upload", 
    verifyToken, 
    upload.single("resume"), 
    uploadResume); 
    
router.post("/roast",
    verifyToken, 
    upload.single("resume"), 
    roastResumeController);
module.exports = router;