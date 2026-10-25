
const path = require("path");
const fs = require("fs");
const axios = require("axios");
const { randomUUID } = require("crypto");
const Project = require("../models/Project");
const Script = require("../models/Script");
const { createVideo, getVideo } = require("./heygenService");

const ROOT = path.resolve(__dirname, "..");
const UPLOADS = path.join(ROOT, "uploads");
const AVATARS_DIR = path.join(UPLOADS, "avatars");
const PRODUCTS_DIR = path.join(UPLOADS, "products");
const VIDEOS_DIR = path.join(UPLOADS, "videos");

fs.mkdirSync(VIDEOS_DIR, { recursive: true });

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function localImagePath(imageUrl, folder) {
  if (!imageUrl) {
    throw new Error("A required reference image is missing.");
  }

  let pathname = imageUrl;

  try {
    if (/^https?:\/\//i.test(imageUrl)) {
      pathname = new URL(imageUrl).pathname;
    }
  } catch {}

  const filename = path.basename(pathname);
  const resolved = path.resolve(folder, filename);

  if (
    path.dirname(resolved) !== path.resolve(folder) ||
    !fs.existsSync(resolved)
  ) {
    throw new Error(
      `Reference image was not found on the server: ${filename}`
    );
  }

  return resolved;
}

function getDuration(value) {
  const match = String(value || "10s").match(/\d+/);
  const seconds = match ? Number(match[0]) : 10;

  return Math.min(15, Math.max(5, seconds));
}

async function saveVideo(url, projectId) {
  const filename =
    `drag-ai-heygen-${String(projectId)}-${randomUUID()}.mp4`;

  const destination = path.join(VIDEOS_DIR, filename);

  const response = await axios.get(url, {
    responseType: "stream",
    timeout: 180000,
  });

  await new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(destination);

    response.data.pipe(writer);

    writer.on("finish", resolve);
    writer.on("error", reject);
    response.data.on("error", reject);
  });

  return `/uploads/videos/${filename}`;
}

async function generateAdvertisement({
  script,
  projectId,
  userId,
  onProgress = () => {},
}) {
  const project = await Project.findOne({
    _id: projectId,
    userId,
  });

  if (!project) {
    throw new Error("Project not found or access denied.");
  }

  if (!project.productImageUrl) {
    throw new Error(
      "Upload a product image before generating your video."
    );
  }

  if (!project.avatar) {
    throw new Error(
      "Select a DRAG.ai avatar before generating your video."
    );
  }

  const avatarImage =
    project.avatar.image_url ||
    project.avatar.imageUrl ||
    project.avatar.thumbnailUrl;

  const avatarPath = localImagePath(avatarImage, AVATARS_DIR);
  const productPath = localImagePath(
    project.productImageUrl,
    PRODUCTS_DIR
  );

  const duration = getDuration(project.videoDuration);
  const avatarName = project.avatar.name || "the selected creator";
  const voiceLanguage = project.language || "English";

  // Retrieve Gemini's saved scene plan for this project.
  const savedScript = project.scriptId
    ? await Script.findOne({
        _id: project.scriptId,
        projectId: project._id,
        userId,
      })
    : await Script.findOne({
        projectId: project._id,
        userId,
      }).sort({ createdAt: -1 });

  const scenePlan = Array.isArray(savedScript?.scenePlan)
    ? savedScript.scenePlan
    : [];

  // Convert Gemini's scene plan into clear physical actions.
  const actionBeats = scenePlan
    .map((scene, index) => {
      const action =
        scene.physicalAction ||
        scene.visualPrompt ||
        scene.description;

      return action
        ? `${index + 1}. ${String(action)
            .replace(/\s+/g, " ")
            .trim()}`
        : "";
    })
    .filter(Boolean)
    .join("\n");

  const prompt = [
    "Create a photorealistic vertical 9:16 UGC product demonstration video, like authentic footage recorded by a real creator on a modern phone.",

    "REFERENCE IMAGES: <Picture 1> is the selected DRAG.ai presenter. Preserve their recognizable face, hairstyle, skin tone and overall appearance. <Picture 2> is the exact uploaded product. Match its packaging, shape, colours and visible label as closely as possible.",

    `Presenter reference name: ${avatarName}. Spoken language: ${voiceLanguage}.`,

    `Product: ${project.productName || "the uploaded product"}. Brand: ${project.brandName || ""}. Product information: ${project.productDescription || ""}.`,

    `Ad style: ${project.adStyle || "UGC review"}. Tone: ${project.tone || "friendly and authentic"}. Audience: ${project.targetAudience || "general consumers"}. CTA: ${project.callToAction || "Learn more"}.`,

    `Speak this exact dialogue naturally in ${voiceLanguage}: "${String(
      script || ""
    )
      .replace(/\s+/g, " ")
      .trim()}". Do not speak stage directions. Fit it naturally into approximately ${duration} seconds.`,

    actionBeats
      ? `GEMINI'S PRODUCT-DEMO SCENE PLAN — follow these actions in order where physically feasible:\n${actionBeats}`
      : "PRODUCT DEMONSTRATION: do more than hold the product. Perform one simple, visible, realistic action that fits the described product category. For skincare, if appropriate, open the product, dispense a small amount onto fingertips, and gently apply it to one cheek. For other products, demonstrate a relevant, safe real-world use. Do not force an unsuitable action.",

    "Make the product actually participate in the action. The presenter should pick it up, manipulate it naturally, and demonstrate its use when appropriate. Keep the product and hands in frame during the demonstration.",

    "Use believable timing, natural pauses and expressions, realistic skin texture, soft practical lighting, subtle handheld phone-camera movement and a natural everyday setting. Prefer one continuous medium close-up shot. The presenter may glance at the product naturally before looking back at the camera.",

    "Maintain physical continuity: one presenter, one consistent product, believable fingers and grip, no object teleportation, no sudden packaging changes, and no impossible gestures.",

    "Do not add unsupported product claims, extra people, fake UI, subtitles, text overlays, watermarks, or logos that are not present in the references. Avoid glossy cinematic advertising style. The result should feel like an authentic creator demonstration.",
  ].join("\n\n");

  onProgress({
    status: "processing",
    progress: 15,
    message: "Uploading avatar and product references to HeyGen...",
  });

  const created = await createVideo({
    prompt,
    avatarImagePath: avatarPath,
    productImagePath: productPath,
    duration,
    aspectRatio: "9:16",
  });

  const videoId = created.video_id;

  onProgress({
    status: "processing",
    progress: 30,
    message: "HeyGen is generating your UGC video and audio...",
  });

  const deadline = Date.now() + 20 * 60 * 1000;
  let result = created;

  while (Date.now() < deadline) {
    const status = String(result.status || "pending").toLowerCase();

    if (status === "completed") break;

    if (["failed", "cancelled", "canceled"].includes(status)) {
      throw new Error(
        result.failure_message ||
          result.message ||
          `HeyGen generation ${status}.`
      );
    }

    await delay(5000);
    result = await getVideo(videoId);

    onProgress({
      status: "processing",
      progress: 65,
      message: "Rendering your video...",
    });
  }

  if (
    String(result.status || "").toLowerCase() !== "completed" ||
    !result.video_url
  ) {
    throw new Error(
      "HeyGen generation timed out or returned no video URL. Check your HeyGen API dashboard before retrying."
    );
  }

  onProgress({
    status: "processing",
    progress: 90,
    message: "Saving your finished video...",
  });

  const localVideoUrl = await saveVideo(
    result.video_url,
    projectId
  );

  await Project.findByIdAndUpdate(projectId, {
    generationStatus: "completed",
    currentStep: "preview",
    videoUrl: localVideoUrl,
    downloadUrl: localVideoUrl,
    latestVideoId: null,
    status: "completed",
  });

  return {
    success: true,
    videoUrl: localVideoUrl,
    downloadUrl: localVideoUrl,
    provider: "HeyGen",
    model: "heygen-video-1",
    providerVideoId: videoId,
  };
}

module.exports = { generateAdvertisement };
