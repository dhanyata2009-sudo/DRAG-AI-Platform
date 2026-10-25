const express = require("express");
const router = express.Router();
const { generateScript } = require("../controllers/scriptController");
const { protect } = require("../middleware/auth");

router.post("/generate", protect, generateScript);

module.exports = router;
