const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");

const API_BASE = "https://api.heygen.com/v3";
const assetCache = new Map();

function apiKey() {
  const key = process.env.HEYGEN_API_KEY;
  if (!key) throw new Error("HEYGEN_API_KEY is missing from backend/.env.");
  return key;
}

function headers() {
  return { "x-api-key": apiKey() };
}

async function uploadReferenceImage(filePath) {
  if (!fs.existsSync(filePath)) throw new Error(`Reference image not found: ${filePath}`);
  const cached = assetCache.get(filePath);
  if (cached) return cached;

  const form = new FormData();
  form.append("file", fs.createReadStream(filePath));
  const response = await axios.post(`${API_BASE}/assets`, form, {
    headers: { ...headers(), ...form.getHeaders() },
    maxBodyLength: Infinity,
    timeout: 120000,
  });
  const data = response.data?.data || response.data;
  const assetId = data?.asset_id || data?.id;
  if (!assetId) throw new Error("HeyGen did not return an asset_id after uploading a reference image.");
  assetCache.set(filePath, assetId);
  return assetId;
}

async function createVideo({ prompt, avatarImagePath, productImagePath, duration = 10, aspectRatio = "9:16" }) {
  const [avatarAssetId, productAssetId] = await Promise.all([
    uploadReferenceImage(avatarImagePath),
    uploadReferenceImage(productImagePath),
  ]);

  const response = await axios.post(`${API_BASE}/models/videos`, {
    model: "heygen-video-1",
    mode: "reference_to_video",
    prompt,
    reference_images: [
      { type: "asset_id", asset_id: avatarAssetId },
      { type: "asset_id", asset_id: productAssetId },
    ],
    duration: Math.min(15, Math.max(5, Number(duration) || 10)),
    resolution: process.env.HEYGEN_VIDEO_RESOLUTION || "768p",
    aspect_ratio: aspectRatio,
    prompt_enhancement: "quality",
  }, {
    headers: { ...headers(), "Content-Type": "application/json" },
    timeout: 120000,
  });

  const data = response.data?.data || response.data;
  if (!data?.video_id) {
    throw new Error(data?.message || "HeyGen did not return a video_id.");
  }
  return data;
}

async function getVideo(videoId) {
  const response = await axios.get(`${API_BASE}/models/videos/${encodeURIComponent(videoId)}`, {
    headers: headers(),
    timeout: 60000,
  });
  return response.data?.data || response.data;
}

module.exports = { createVideo, getVideo };
