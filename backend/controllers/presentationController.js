const path = require("path");
const fs = require("fs");
const Presentation = require("../models/Presentation");
const { createHistoryLog } = require("./historyController");
const { generatePresentation } = require("../services/presentationService");
const { retrieveSourceContext } = require("../services/pptSourceRagService");

// POST /api/presentations - create a draft record
const createPresentationController = async (req, res) => {
  try {
    const { title, topic, targetAudience, slideCount } = req.body;
    const presentation = await Presentation.create({
      userId: req.user._id,
      title,
      topic,
      targetAudience,
      slideCount: Number(slideCount) || 6,
      status: "draft",
      currentStep: "generate",
    });
    res.status(201).json({ success: true, presentation });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// GET /api/presentations
const getMyPresentations = async (req, res) => {
  try {
    const presentations = await Presentation.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: presentations.length, presentations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/presentations/:id
const getPresentationById = async (req, res) => {
  try {
    const presentation = await Presentation.findOne({ _id: req.params.id, userId: req.user._id });
    if (!presentation) {
      return res.status(404).json({ success: false, message: "Presentation not found" });
    }
    res.status(200).json({ success: true, presentation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/presentations/generate
const generatePresentationController = async (req, res) => {
  try {
    const { presentationId, topic, title, slideCount, audience } = req.body || {};

    if (!topic) {
      return res.status(400).json({ success: false, message: "Topic is required" });
    }

    const sourceContext = req.file
      ? await retrieveSourceContext({ file: req.file, topic, title, audience })
      : null;

    const result = await generatePresentation({
      topic,
      title,
      slideCount: Number(slideCount) || 6,
      audience,
      sourceContext,
    });

    let presentation = null;
    if (presentationId) {
      presentation = await Presentation.findOneAndUpdate(
        { _id: presentationId, userId: req.user._id },
        {
          status: "completed",
          currentStep: "completed",
          fileName: result.fileName || result.file || null,
          downloadUrl: result.downloadUrl || result.url || null,
          slides: result.slides || [],
        },
        { new: true }
      );
    } else {
      presentation = await Presentation.create({
        userId: req.user._id,
        title,
        topic,
        targetAudience: audience,
        slideCount: Number(slideCount) || 6,
        status: "completed",
        currentStep: "completed",
        fileName: result.fileName || result.file || null,
        downloadUrl: result.downloadUrl || result.url || null,
        slides: result.slides || [],
      });
    }

    await createHistoryLog({
      userId: req.user._id,
      projectId: null,
      action: "PPT_GENERATED",
      entityType: "PPT",
      entityId: presentation?._id || null,
      description: `Generated presentation "${title || topic}"`,
    });

    res.status(201).json({
      success: true,
      message: "Presentation generated successfully",
      presentation,
      file: result,
      source: sourceContext ? { fileName: sourceContext.sourceFileName, characters: sourceContext.sourceCharacters, retrievedChunks: sourceContext.retrievedChunks, retrievalMethod: sourceContext.retrievalMethod } : null,
    });
  } catch (error) {
    console.error("PPT generation error:", error);
    res.status(500).json({ success: false, message: "Failed to generate presentation", error: error.message });
  }
};

const downloadPresentationController = (req, res) => {
  try {
    const { fileName } = req.params;
    const filePath = path.join(process.cwd(), fileName);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: "PPT file not found" });
    }
    res.download(filePath, fileName, {
      headers: { "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation" },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to download presentation" });
  }
};

module.exports = {
  createPresentationController,
  getMyPresentations,
  getPresentationById,
  generatePresentationController,
  downloadPresentationController,
};
