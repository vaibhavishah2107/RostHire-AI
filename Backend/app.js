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
app.use((err, req, res, next) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      message: "File is too large. Please upload a PDF under 10 MB.",
    });
  }

  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message || "Upload failed.",
    });
  }

  next();
});
module.exports = app;