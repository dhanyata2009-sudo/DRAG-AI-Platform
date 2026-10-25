const express = require("express");
const router = express.Router();

const {
  startGeneration,
  getGenerationStatus,
} = require("../controllers/adPipelineController");

const { protect } = require("../middleware/auth");

router.post("/generate", protect, startGeneration);
router.get("/status/:jobId", protect, getGenerationStatus);

module.exports = router;