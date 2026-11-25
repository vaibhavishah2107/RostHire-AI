const { PDFParse } = require("pdf-parse");

const { roastResume , isBusyError } = require("../services/ai.service");

async function roastResumeController(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Resume file is required.",
            });
        }

        const roastLevel = req.body.roastLevel || "brutal";

        const allowedLevels = ["mild", "brutal", "nuclear"];

        if (!allowedLevels.includes(roastLevel)) {
            return res.status(400).json({
                success: false,
                message: "Invalid roast level.",
            });
        }

        // With memory storage the PDF is in req.file.buffer, not on disk
        const data = req.file.buffer;

        // Parse PDF
        const parser = new PDFParse({ data });

        const result = await parser.getText();

        const text = result.text
            .replace(/\r\n/g, "\n")
            .replace(/\n{2,}/g, "\n")
            .trim();

        // Send resume text to Gemini
        const roast = await roastResume(text, roastLevel);

        return res.status(200).json({
            success: true,
            message: "Resume roasted successfully.",
            roast,
        });

       } catch (error) {
        console.error("ROAST ERROR:", error);

        if (isBusyError(error)) {
            return res.status(503).json({
                success: false,
                message: "Our AI is very busy right now. Please try again in a minute.",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Unable to roast resume.",
        });
    }
}

module.exports = roastResumeController;