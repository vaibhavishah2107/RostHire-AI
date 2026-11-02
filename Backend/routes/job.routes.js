const express = require("express");

const router = express.Router();

const verifyToken = require("../middleware/auth.middleware");
const matchJobController = require("../controller/job.controller");
const requireHiringTeam = require("../middleware/requireHiringTeam")
const {
  createJob,
  getOpenJobs,
  getMyJobs,
} = require("../controller/jobs.controller");

// Public job search.
router.get("/", getOpenJobs);

// Verified hiring team's own job listings.
router.get(
  "/mine",
  verifyToken,
  requireHiringTeam,
  getMyJobs
);

// Only verified hiring teams can publish jobs.
router.post(
  "/",
  verifyToken,
  requireHiringTeam,
  createJob
);

router.post(
  "/match",
  verifyToken,
  matchJobController
);

module.exports = router;