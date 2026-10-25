const { createMarketingScript } = require("../services/scriptService");
const Project = require("../models/Project");
const Script = require("../models/Script");

const generateScript = async (req, res) => {
  try {
    const { projectId } = req.body;
    if (!projectId) return res.status(400).json({ success: false, message: "projectId is required." });

    const project = await Project.findOne({ _id: projectId, userId: req.user._id });
    if (!project) return res.status(404).json({ success: false, message: "Project not found." });

    const response = await createMarketingScript(project.toObject());
    if (!response.success) return res.status(400).json(response);

    const savedScript = await Script.create({
      userId: req.user._id,
      projectId: project._id,
      prompt: response.prompt,
      generatedScript: response.generatedScript,
      scenePlan: response.scenePlan,
      generationModel: response.generationModel,
      language: project.language,
    });

    await Project.findByIdAndUpdate(project._id, {
      scriptId: savedScript._id,
      script: savedScript.generatedScript,
      scriptText: savedScript.generatedScript,
    });

    return res.status(200).json({ success: true, message: "Advertisement generated successfully", script: savedScript });
  } catch (error) {
    console.error("GEMINI SCRIPT ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to generate advertisement.", error: error.message });
  }
};

module.exports = { generateScript };
