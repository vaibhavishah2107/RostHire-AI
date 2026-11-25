const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    const looksLikePdf =
      file.mimetype === "application/pdf" ||
      file.mimetype === "application/x-pdf" ||
      file.originalname.toLowerCase().endsWith(".pdf");

    if (!looksLikePdf) {
      return cb(new Error("Please upload a PDF file."));
    }
    cb(null, true);
  },
});

module.exports = upload;