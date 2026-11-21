const { PDFParse } = require("pdf-parse");
const {
  analyzeResume,
  buildSkillProofMap,
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

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}