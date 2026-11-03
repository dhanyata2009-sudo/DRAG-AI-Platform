const { GoogleGenerativeAI } = require('@google/generative-ai');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getStatus = (error) => Number(error?.status || error?.httpStatus || 0);
const getMessage = (error) => String(error?.message || '');

// Daily/request quota errors should not be retried on the same model.
const isQuotaExhausted = (error) => {
  const status = getStatus(error);
  const message = getMessage(error);
  return status === 429 && /quota|resource_exhausted|rate.?limit|limit:|retry in/i.test(message);
};

const isTransient = (error) => {
  const status = getStatus(error);
  const message = getMessage(error);
  return [408, 429, 500, 502, 503, 504].includes(status)
    || /high demand|temporarily unavailable|overloaded|try again later|\b503\b|\b429\b/i.test(message);
};

const isUnavailableModel = (error) => {
  const status = getStatus(error);
  const message = getMessage(error);
  return status === 404 || /model .*not available|no longer available|unknown model/i.test(message);
};

const getModelNames = () => [...new Set([
  process.env.GEMINI_MODEL || 'gemini-3.8-flash',
  'gemini-3.6-flash',
  'gemini-3.5-flash-lite',
].map((name) => String(name).trim()).filter(Boolean))];

/**
 * Generate content with the configured Gemini model and then configured fallbacks.
 * Quota-exhausted models are skipped immediately; temporary service errors get one retry.
 */
const generateGeminiContent = async (contents, generationConfig = {}) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is missing from backend/.env');
  }

  const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const modelNames = getModelNames();
  let lastError;

  for (const modelName of modelNames) {
    const model = client.getGenerativeModel({ model: modelName, generationConfig });

    // One initial request plus at most one retry for temporary overload/server errors.
    for (let attempt = 1; attempt <= 2; attempt += 1) {
      try {
        const result = await model.generateContent(contents);
        if (modelName !== modelNames[0]) {
          console.warn(`[gemini] Successfully used fallback model: ${modelName}`);
        }
        return { result, modelName };
      } catch (error) {
        lastError = error;
        const status = getStatus(error);
        const message = getMessage(error);
        const quotaExhausted = isQuotaExhausted(error);
        const unavailableModel = isUnavailableModel(error);
        const transient = isTransient(error);

        console.warn(`[gemini] ${modelName} attempt ${attempt} failed (${status || 'unknown'}): ${message}`);

        // Do not waste a second request when the model's quota is already exhausted.
        if (quotaExhausted) {
          console.warn(`[gemini] Quota exhausted for ${modelName}; skipping to the next model.`);
          break;
        }

        // Retry only temporary errors once. A 429 that is not clearly quota exhaustion
        // may be a short rate limit, so it gets the same brief retry as other transient errors.
        if (transient && attempt < 2) {
          await sleep(1000 * (2 ** (attempt - 1)));
          continue;
        }

        if (unavailableModel || transient) break;

        // Invalid key, malformed request, and permission errors will not be fixed by a fallback.
        throw error;
      }
    }
  }

  const status = getStatus(lastError);
  const detail = getMessage(lastError) || 'Unknown Gemini API error';
  const error = new Error(`All configured Gemini models failed. Last error (${status || 'unknown'}): ${detail}`);
  error.status = status || 503;
  error.cause = lastError;
  throw error;
};

module.exports = { generateGeminiContent };