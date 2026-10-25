const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    scriptId: { type: mongoose.Schema.Types.ObjectId, ref: "Script", default: null },
    avatar: { type: mongoose.Schema.Types.Mixed, default: null },
    voice: { type: mongoose.Schema.Types.Mixed, default: null },
    language: { type: String, default: "English", trim: true },
    adStyle: { type: String, default: "UGC", trim: true },
    productImageUrl: { type: String, default: null },
    scenePlan: { type: [mongoose.Schema.Types.Mixed], default: [] },
    generationRequest: { type: mongoose.Schema.Types.Mixed, default: null },
    videoProvider: { type: String, default: "heygen" },
    videoModel: { type: String, default: "HeyGen Video 1" },
    audioUrl: { type: String, default: null },
    videoUrl: { type: String, default: null },
    thumbnailUrl: { type: String, default: null },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },
    progress: { type: String, default: "0/0" },
    duration: { type: Number, default: 0 },
    errorMessage: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Video", videoSchema);
