const express = require("express");
const router = express.Router();
const { getMyHistory, getHistoryById, deleteHistory } = require("../controllers/historyController");
const { protect } = require("../middleware/auth");

router.get("/", protect, getMyHistory);
router.get("/:id", protect, getHistoryById);
router.delete("/:id", protect, deleteHistory);

module.exports = router;
