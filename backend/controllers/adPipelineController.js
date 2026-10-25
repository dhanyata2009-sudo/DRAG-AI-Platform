
const { randomUUID } = require("crypto");
const Project = require("../models/Project");
const { generateAdvertisement } = require("../services/adPipelineService");

const jobs = new Map();
const activeJobByProject = new Map();

async function startGeneration(req, res) {
  try {
    const { script, projectId } = req.body;

    if (typeof script !== "string" || !script.trim()) {
      return res.status(400).json({
        success: false,
        message: "Generated script is required.",
      });
    }

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: "Project ID is required.",
      });
    }

    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message: "Please log in before generating a video.",
      });
    }

    const userId = String(req.user._id);

    const project = await Project.findOne({
      _id: projectId,
      userId: req.user._id,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found or access denied.",
      });
    }

    if (!project.productImageUrl) {
      return res.status(400).json({
        success: false,
        message: "Upload a product image before generating the video.",
      });
    }

    const generationKey = `${userId}:${projectId}`;
    const existingJobId = activeJobByProject.get(generationKey);
    const existingJob = existingJobId
      ? jobs.get(existingJobId)
      : null;

    if (
      existingJob &&
      existingJob.status === "processing"
    ) {
      return res.status(200).json({
        success: true,
        jobId: existingJob.jobId,
        status: existingJob.status,
        videoUrl: existingJob.videoUrl,
        downloadUrl: existingJob.downloadUrl,
        message: "Returning the existing generation job.",
      });
    }

    const jobId = randomUUID();

    activeJobByProject.set(generationKey, jobId);

    jobs.set(jobId, {
      jobId,
      userId,
      status: "processing",
      progress: 5,
      message: "Starting advertisement generation...",
      videoUrl: null,
      downloadUrl: null,
      error: null,
    });

    res.status(202).json({
      success: true,
      jobId,
      status: "processing",
      message: "Your advertisement is being generated.",
    });

    generateAdvertisement({
      script,
      projectId,
      userId: req.user._id,
      onProgress: (update) => {
        const current = jobs.get(jobId);
        if (current) jobs.set(jobId, { ...current, ...update });
      },
    })
      .then((result) => {
        const currentJob = jobs.get(jobId);
        if (!currentJob) return;

        activeJobByProject.delete(generationKey);
        jobs.set(jobId, {
          ...currentJob,
          status: "completed",
          progress: 100,
          message: "Your advertisement is ready.",
          videoUrl: result.videoUrl,
          downloadUrl: result.downloadUrl || result.videoUrl,
          error: null,
        });
      })
      .catch((error) => {
        console.error("DRAG.ai generation failed:", error);

        const currentJob = jobs.get(jobId);
        if (!currentJob) return;

        // Remove the lock on failure so the user can retry.
        activeJobByProject.delete(generationKey);

        jobs.set(jobId, {
          ...currentJob,
          status: "failed",
          progress: 0,
          message: "Advertisement generation failed.",
          videoUrl: null,
          downloadUrl: null,
          error: error.message || "Unknown generation error",
        });
      });
  } catch (error) {
    console.error("Could not start ad generation:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Could not start generation.",
    });
  }
}

function getGenerationStatus(req, res) {
  const job = jobs.get(req.params.jobId);

  if (!job || job.userId !== String(req.user?._id)) {
    return res.status(404).json({
      success: false,
      message: "Generation job not found.",
    });
  }

  const { userId, ...publicJob } = job;

  return res.json({
    success: true,
    ...publicJob,
  });
}

module.exports = {
  startGeneration,
  getGenerationStatus,
};