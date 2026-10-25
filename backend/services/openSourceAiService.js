const axios = require("axios");

/**
 * Generates text using a genuinely open-source, open-weight model
 * (e.g. Meta's Llama 3.1) through Hugging Face's free router API.
 *
 * This requires only a free Hugging Face account + access token
 * (huggingface.co/settings/tokens) — no billing, no proprietary model.
 * Set HF_TOKEN in your .env to enable this as the PPT content engine.
 *
 * Throws on any failure (missing token, network error, bad response) —
 * the caller (pptContentService) is responsible for falling back to
 * another provider or to the deterministic offline generator.
 */

const HF_ROUTER_URL = "https://router.huggingface.co/v1/chat/completions";
const DEFAULT_MODEL = "meta-llama/Llama-3.1-8B-Instruct";
const REQUEST_TIMEOUT_MS = 30000;

const generateWithOpenSourceModel = async (prompt) => {
  const token = process.env.HF_TOKEN;
  if (!token) {
    throw new Error("HF_TOKEN is not configured");
  }

  const model = process.env.HF_MODEL || DEFAULT_MODEL;

  const response = await axios.post(
    HF_ROUTER_URL,
    {
      model,
      messages: [
        {
          role: "system",
          content: "You are a precise assistant that returns only valid JSON when asked to, with no extra commentary.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.6,
      max_tokens: 2200,
    },
    {
      timeout: REQUEST_TIMEOUT_MS,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  const text = response.data?.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error("Open-source model returned an empty response");
  }

  return text;
};

module.exports = {
  generateWithOpenSourceModel,
};
