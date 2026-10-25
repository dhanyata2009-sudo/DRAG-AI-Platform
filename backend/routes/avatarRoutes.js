const express = require("express");
const router = express.Router();
const avatarController = require("../controllers/avatarController");

router.get("/", avatarController.getAvatars);

module.exports = router;
