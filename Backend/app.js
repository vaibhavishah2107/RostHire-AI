const express = require("express");
const cors = require("cors");
const app = express();
const health = require("./routes/health.routes");
const authRouter = require("./routes/auth.routes");
const resumeRouter = require("./routes/resume.routes");
const jobRouter = require("./routes/job.routes");
const jobsRouter = require("./routes/job.routes");
app.use(express.json());
app.use(cors({
  origin: ["http://localhost:5173", "https://rost-hire-ai.vercel.app", "https://roast-hire-ai.vercel.app" ],
  credentials: true
}));
app.use("/api/auth",authRouter);
app.use("/api/resume",resumeRouter);
app.use("/api/job", jobRouter);
app.use("/api/jobs", jobsRouter);
module.exports = app;