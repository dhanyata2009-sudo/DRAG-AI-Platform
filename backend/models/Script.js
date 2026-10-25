const mongoose = require("mongoose");

const scriptSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    prompt: { type: String, required: true },
    generatedScript: { type: String, required: true },
    scenePlan: { type: [mongoose.Schema.Types.Mixed], default: [] },
    generationModel: { type: String, default: "Gemini" },
    language: { type: String, default: "English", trim: true },
    version: { type: Number, default: 1 },
    status: { type: String, enum: ["generated", "approved"], default: "generated" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Script", scriptSchema);
