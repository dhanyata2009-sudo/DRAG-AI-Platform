const Project = require("../models/Project");
const { createHistoryLog } = require("./historyController");
const { createNotification } = require("./notificationController");

exports.createProject = async (req, res) => {
  try {
    const required = ["projectName", "productName", "brandName", "productDescription"];
    const missing = required.find((field) => !String(req.body[field] || "").trim());
    if (missing) return res.status(400).json({ success: false, error: `${missing} is required.` });

    const project = await Project.create({
      ...req.body,
      userId: req.user._id,
      currentStep: "details",
      generationStatus: "idle",
      status: "draft",
    });

    await createHistoryLog({ userId: req.user._id, projectId: project._id, action: "PROJECT_CREATED", entityType: "Project", entityId: project._id, description: `Created project "${project.projectName}"` });
    await createNotification({ userId: req.user._id, projectId: project._id, title: "Project created", message: `Your project "${project.projectName}" was created successfully.`, type: "project" });

    return res.status(201).json({ success: true, project });
  } catch (error) {
    console.error("CREATE PROJECT ERROR:", error);
    return res.status(400).json({ success: false, error: error.message });
  }
};

exports.getMyProjects = async (req, res) => {
  try {
    const projects = await Project.find({ userId: req.user._id }).sort({ updatedAt: -1 });
    return res.status(200).json({ success: true, count: projects.length, projects });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, userId: req.user._id });
    if (!project) return res.status(404).json({ success: false, error: "Project not found" });
    return res.status(200).json({ success: true, project });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!project) return res.status(404).json({ success: false, error: "Project not found" });
    return res.status(200).json({ success: true, project });
  } catch (error) {
    console.error("UPDATE PROJECT ERROR:", error);
    return res.status(400).json({ success: false, error: error.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!project) return res.status(404).json({ success: false, error: "Project not found" });
    return res.status(200).json({ success: true, message: "Project deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.uploadProductImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: "Product image is required." });
    const project = await Project.findOne({ _id: req.params.id, userId: req.user._id });
    if (!project) return res.status(404).json({ success: false, error: "Project not found." });

    const productImageUrl = `${req.protocol}://${req.get("host")}/uploads/products/${req.file.filename}`;
    project.productImageUrl = productImageUrl;
    await project.save();

    return res.status(200).json({ success: true, productImageUrl, project });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message || "Failed to upload product image." });
  }
};
