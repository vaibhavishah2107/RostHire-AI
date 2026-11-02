const Resume = require("../models/resume");
const { matchJob } = require("../services/ai.service");

async function matchJobController(req, res) {
  try {
    const { jobDescription } = req.body;

    if (!jobDescription) {
      return res.status(400).json({
        success: false,
        message: "Job description is required.",
      });
    }

    const resume = await Resume.findOne({
      userId: req.user.id,
    }).sort({ createdAt: -1 });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Please upload a resume first.",
      });
    }

    const result = await matchJob(
      resume.extractedText,
      jobDescription
    );

    return res.status(200).json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("JOB MATCH ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to match resume with job description.",
    });
  }
}

module.exports = matchJobController;