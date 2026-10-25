const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    projectName: { type: String, trim: true, required: true },
    productName: { type: String, trim: true, required: true },
    brandName: { type: String, trim: true, required: true },
    productDescription: { type: String, trim: true, required: true },
    targetAudience: { type: String, trim: true, default: "" },
    marketingGoal: { type: String, trim: true, default: "" },
    platform: { type: String, trim: true, default: "Instagram" },
    adStyle: { type: String, trim: true, default: "UGC" },
    tone: { type: String, trim: true, default: "Friendly" },
    language: { type: String, trim: true, default: "English" },
    videoDuration: { type: String, trim: true, default: "15s" },
    callToAction: { type: String, trim: true, default: "" },
    productImageUrl: { type: String, default: null },

    // User selections used by the hidden generation pipeline.
    avatar: { type: mongoose.Schema.Types.Mixed, default: null },
    voice: { type: mongoose.Schema.Types.Mixed, default: null },

    // AI-generated data is hidden from the normal user workflow but persisted for reproducibility.
    script: { type: String, default: "" },
    scriptText: { type: String, default: "" },
    scriptId: { type: mongoose.Schema.Types.ObjectId, ref: "Script", default: null },

    currentStep: {
      type: String,
      enum: ["details", "avatar", "voice", "generating", "preview", "completed"],
      default: "details",
    },

    generationStatus: {
      type: String,
      enum: [
        "idle",
        "queued",
        "generating_script",
        "generating_voice",
        "generating_creator_video",
        "creating_product_scenes",
        "assembling_video",
        "completed",
        "failed",
      ],
      default: "idle",
    },

    latestVideoId: { type: mongoose.Schema.Types.ObjectId, ref: "Video", default: null },
    videoUrl: { type: String, default: null },
    downloadUrl: { type: String, default: null },
    videoThumbnail: { type: String, default: null },

    status: {
      type: String,
      enum: ["draft", "active", "completed", "archived"],
      default: "draft",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);
