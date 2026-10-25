const mongoose = require("mongoose");

const presentationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, trim: true, default: "Untitled Presentation" },
    topic: { type: String, trim: true, default: "" },
    targetAudience: { type: String, trim: true, default: "" },
    slideCount: { type: Number, default: 6 },
    status: { type: String, enum: ["draft", "active", "completed", "archived"], default: "draft" },
    currentStep: { type: String, enum: ["details", "generate", "completed"], default: "details" },
    fileName: { type: String, default: null },
    slides: { type: mongoose.Schema.Types.Mixed, default: [] },
    downloadUrl: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Presentation", presentationSchema);

