const express = require("express");
const router = express.Router();
const {
    createProject,
    getMyProjects,
    getProjectById,
    updateProject,
    deleteProject,
    uploadProductImage,
} = require("../controllers/projectController");
const {
    uploadProductImage: uploadProductImageMiddleware,
} = require("../middleware/upload");
const { protect } = require("../middleware/auth");

router.post("/", protect, createProject);
router.get("/", protect, getMyProjects);
router.get("/:id", protect, getProjectById);
router.put("/:id", protect, updateProject);
router.delete("/:id", protect, deleteProject);
router.post(
    "/:id/product-image",
    protect,
    uploadProductImageMiddleware.single("productImage"),
    uploadProductImage
);
module.exports = router;
