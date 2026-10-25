const express = require("express");
const router = express.Router();
const { getMySettings, updateMySettings } = require("../controllers/settingsController");
const { protect } = require("../middleware/auth");

router.get("/", protect, getMySettings);
router.put("/", protect, updateMySettings);

module.exports = router;
