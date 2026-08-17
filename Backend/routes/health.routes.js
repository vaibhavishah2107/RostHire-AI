const healthAPI = require("../controller/health.controller");
const express = require("express");
const router = express.Router();

router.get("/", healthAPI );

module.exports = router;