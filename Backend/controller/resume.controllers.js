const fs = require("fs").promises;
const { PDFParse } = require("pdf-parse");

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

        const cleanedLines = lines.map(line => {
            return line.trim();
        });

        const cleanedText = cleanedLines.join("\n");

        console.log("Original text:");
        console.log(text);

        console.log("Cleaned text:");
        console.log(cleanedText);

        return res.status(200).json({
            success: true,
            message: "Resume uploaded successfully.",
            file: req.file.filename,
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
}

module.exports = uploadResume;