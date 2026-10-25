const express = require("express");
const router = express.Router();
const { getMyNotifications, markAsRead, deleteNotification } = require("../controllers/notificationController");
const { protect } = require("../middleware/auth");

router.get("/", protect, getMyNotifications);
router.put("/:id/read", protect, markAsRead);
router.delete("/:id", protect, deleteNotification);

module.exports = router;
