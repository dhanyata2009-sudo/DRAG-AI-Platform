const express = require("express");
const router = express.Router();
const { register, login, forgotPassword, resetPassword, changePassword } = require("../controllers/authController");
const { protect } = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.put("/change-password", protect, changePassword);

router.get("/profile", protect, (req, res) => {
  res.json({ success: true, user: req.user });
});

module.exports = router;


