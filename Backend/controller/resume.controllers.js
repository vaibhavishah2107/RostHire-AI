const fs = require("fs").promises;
const { PDFParse } = require("pdf-parse");
const {
  analyzeResume,
  buildSkillProofMap,
} = require("../services/ai.service.js");
const Resume = require("../models/resume");
async function uploadResume(req, res) {
  try {
    console.log(req.file);

    const data = await fs.readFile(req.file.path);

    const parser = new PDFParse({ data });

    const result = await parser.getText();

    const text = result.text
      .replace(/\r\n/g, "\n")
      .replace(/\n{2,}/g, "\n")
      .trim();

    const lines = text.split("\n");

    const cleanedLines = lines.map((line) => {
      return line.trim();
    });

    const cleanedText = cleanedLines.join("\n");
    const savedResume = await Resume.create({
  userId: req.user.id,
  fileName: req.file.filename,
  filePath: req.file.path,
  extractedText: cleanedText,
});
    const analysis = await analyzeResume(cleanedText);

    console.log("AI ANALYSIS:");
    console.log(analysis);

    console.log("Original text:");
    console.log(text);

    console.log("Cleaned text:");
    console.log(cleanedText);

    return res.status(200).json({
  success: true,
  message: "Resume analyzed successfully.",
  resumeId: savedResume._id,
  analysis: analysis,
});
  } catch (error) {
    console.log(error);

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
