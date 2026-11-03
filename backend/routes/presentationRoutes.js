const express = require("express");
const router = express.Router();
const {
  createPresentationController,
  getMyPresentations,
  getPresentationById,
  generatePresentationController,
  downloadPresentationController,
} = require("../controllers/presentationController");
const { protect } = require("../middleware/auth");
const multer = require("multer");

const pptSourceUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    const allowed = [".pdf", ".png", ".jpg", ".jpeg", ".webp", ".txt", ".md", ".csv", ".html", ".htm"];
    const ext = require("path").extname(file.originalname || "").toLowerCase();
    if (allowed.includes(ext)) return cb(null, true);
    cb(new Error("Unsupported source file type. Upload PDF, PNG, JPG, WEBP, TXT, MD, CSV or HTML."));
  },
});

router.post("/", protect, createPresentationController);
router.get("/", protect, getMyPresentations);
router.get("/:id", protect, getPresentationById);
router.post(
  "/generate",
  protect,
  pptSourceUpload.single("sourceFile"),
  generatePresentationController
);
router.get("/download/:fileName", downloadPresentationController);

module.exports = router;