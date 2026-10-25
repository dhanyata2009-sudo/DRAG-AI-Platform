const axios = require("axios");

/**
 * Generate slide images through Hugging Face's current Inference Providers
 * router. The old api-inference.huggingface.co/model endpoint was replaced
 * by the router-based provider endpoint for this workflow.
 */

const DEFAULT_IMAGE_MODEL = "stabilityai/stable-diffusion-3-medium-diffusers";
const REQUEST_TIMEOUT_MS = 90000;
const RETRY_DELAY_MS = 5000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const buildInferenceUrl = (model) =>
  `https://router.huggingface.co/hf-inference/models/${model}`;

// FLUX.1-schnell is still a valid Hub model, but the hf-inference provider
// currently rejects it with HTTP 410. Keep old .env files from breaking image
// generation by transparently moving them to a model currently listed for
// the HF Inference provider.
const resolveImageModel = () => {
  const configured = String(process.env.HF_IMAGE_MODEL || "").trim();
  if (!configured || configured === "black-forest-labs/FLUX.1-schnell") {
    return DEFAULT_IMAGE_MODEL;
  }
  return configured;
};

const requestImage = async (prompt) => {
  const token = process.env.HF_TOKEN;
  if (!token) return null;

  const model = resolveImageModel();
  const response = await axios.post(
    buildInferenceUrl(model),
    {
      inputs: prompt,
      parameters: {
        num_inference_steps: Number(process.env.HF_IMAGE_STEPS) || 28,
      },
      options: { wait_for_model: true },
    },
    {
      timeout: REQUEST_TIMEOUT_MS,
      responseType: "arraybuffer",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "image/png",
        "Content-Type": "application/json",
      },
      validateStatus: () => true,
    }
  );

  const contentType = String(response.headers?.["content-type"] || "").toLowerCase();
  const buffer = Buffer.from(response.data || []);

  // Successful text-to-image calls return the actual image bytes.
  if (response.status >= 200 && response.status < 300 && contentType.startsWith("image/")) {
    if (!buffer.length) {
      throw new Error("Hugging Face returned an empty image");
    }

    return {
      mime: contentType.split(";")[0].trim() || "image/png",
      base64: buffer.toString("base64"),
    };
  }

  // Error responses from the router are JSON, even when Accept=image/png.
  let detail = "";
  try {
    const parsed = JSON.parse(buffer.toString("utf8"));
    detail = parsed?.error || parsed?.message || "";
    if (parsed?.estimated_time) {
      detail += ` (estimated wait: ${parsed.estimated_time}s)`;
    }
  } catch (_) {
    detail = buffer.toString("utf8").slice(0, 300);
  }

  throw new Error(
    `HF image request failed (${response.status})${detail ? `: ${detail}` : ""}`
  );
};

const generateSlideImage = async (prompt) => {
  if (!process.env.HF_TOKEN) {
    console.warn("PPT images skipped: HF_TOKEN is not configured.");
    return null;
  }

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const image = await requestImage(prompt);

      if (image?.base64) {
        console.log(`PPT image generated successfully (attempt ${attempt}).`);
        return image;
      }
    } catch (error) {
      console.error(
        `PPT image generation attempt ${attempt} failed:`,
        error?.message || error
      );

      if (attempt < 3) {
        await sleep(RETRY_DELAY_MS);
      }
    }
  }

  console.error("PPT image generation failed after 3 attempts; continuing without image.");
  return null;
};

module.exports = {
  generateSlideImage,
};
