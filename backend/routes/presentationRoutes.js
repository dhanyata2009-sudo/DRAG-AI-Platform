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

router.post("/", protect, createPresentationController);
router.get("/", protect, getMyPresentations);
router.get("/:id", protect, getPresentationById);
router.post("/generate", protect, generatePresentationController);
router.get("/download/:fileName", downloadPresentationController);

module.exports = router;
