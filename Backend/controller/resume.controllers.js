const { PDFParse } = require("pdf-parse");
const {
  analyzeResume,
  buildSkillProofMap,
  isBusyError,
} = require("../services/ai.service.js");
const Resume = require("../models/resume");

async function uploadResume(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a PDF file.",
      });
    }

    // With memory storage the file is in req.file.buffer, not on disk
    const data = req.file.buffer;

    const parser = new PDFParse({ data });
    const result = await parser.getText();

    const text = result.text
      .replace(/\r\n/g, "\n")
      .replace(/\n{2,}/g, "\n")
      .trim();

    const cleanedText = text
      .split("\n")
      .map((line) => line.trim())
      .join("\n");

    const savedResume = await Resume.create({
      userId: req.user.id,
      fileName: req.file.originalname,
      extractedText: cleanedText,
    });

    const analysis = await analyzeResume(cleanedText);

    return res.status(200).json({
      success: true,
      message: "Resume analyzed successfully.",
      resumeId: savedResume._id,
      analysis: analysis,
    });
  } catch (error) {
  console.log(error);

  if (isBusyError(error)) {
    return res.status(503).json({
      success: false,
      message: "Our AI is very busy right now. Please try again in a minute.",
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
}
}

async function buildSkillProofMapController(req, res) {
  try {
    const query = { userId: req.user.id };

    if (req.body?.resumeId) {
      query._id = req.body.resumeId;
    }

    const savedResume = await Resume.findOne(query).sort({ _id: -1 });

    if (!savedResume) {
      return res.status(404).json({
        success: false,
        message: "Please upload your resume first.",
      });
    }

    const result = await buildSkillProofMap(savedResume.extractedText);

    return res.status(200).json({
      success: true,
      feature: "Skill Proof Map",
      resumeId: savedResume._id,
      result,
    });
  } catch (error) {
    console.error("SKILL PROOF MAP ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to generate Skill Proof Map.",
    });
  }
}

module.exports = uploadResume;
module.exports.buildSkillProofMap = buildSkillProofMapController;