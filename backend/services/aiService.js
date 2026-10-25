
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { buildPrompt } = require("../utils/promptBuilder");

const generateScriptFromAI = async (projectData) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing from backend/.env");
  }

  // Use a known model name as the default, and allow .env to override it.
  const modelName = process.env.GEMINI_MODEL || "gemini-3.8-flash";

  try {
    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    });

    const prompt = buildPrompt(projectData);
    
let result;

try {
  result = await model.generateContent(prompt);
} catch (error) {
  const message = String(error?.message || error);

  const isTemporaryError =
    message.includes("503") ||
    message.includes("429") ||
    message.includes("UNAVAILABLE") ||
    message.includes("high demand") ||
    message.includes("overloaded");

  if (!isTemporaryError) {
    throw error;
  }

  console.warn(
    "Gemini unavailable. Using DRAG.ai fallback script."
  );

  const project = projectData?.project || projectData || {};

  const productName =
    project.productName || project.name || "our product";

  const brandName =
    project.brandName || project.brand || "our brand";

  const description =
    project.productDescription ||
    project.description ||
    "a product designed for everyday convenience";

  const audience =
    project.targetAudience || "people looking for quality products";

  const cta =
    project.callToAction ||
    project.cta ||
    "Try it today";

  const script =
    `Looking for a better solution for your everyday needs? ` +
    `${brandName} brings you ${productName}. ` +
    `${description}. Designed for ${audience}, ` +
    `it could be the perfect addition to your routine. ` +
    `${cta}!`;

  const scenes = [
    {
      scene: 1,
      description: `Introduce ${productName} with the presenter.`,
      narration: `Looking for a better solution for your everyday needs?`
    },
    {
      scene: 2,
      description: `Show ${productName} and its key features.`,
      narration: `${brandName} brings you ${productName}. ${description}.`
    },
    {
      scene: 3,
      description: `Show the product clearly and end with a call to action.`,
      narration: `Designed for ${audience}, it could be the perfect addition to your routine. ${cta}!`
    }
  ];

  return {
   
  success: true,
  script,
  generatedScript: script,
  prompt,
  scenes,
  scenePlan: scenes,
  model: "local-fallback",
  fallbackUsed: true,
  warning: "Gemini was temporarily unavailable."
  };
}

    const responseText = result.response.text();

    let generated;

    try {
      generated = JSON.parse(responseText);
    } catch {
      throw new Error("The AI returned invalid JSON. Please try again.");
    }

    if (
      !generated ||
      typeof generated.script !== "string" ||
      !generated.script.trim() ||
      !Array.isArray(generated.scenes) ||
      generated.scenes.length === 0
    ) {
      throw new Error(
        "The AI returned an incomplete script or scene plan."
      );
    }

    return {
      ...generated,
      script: generated.script.trim(),
      generatedScript: generated.script.trim(),
      scenePlan: generated.scenes,
      prompt,
      model: modelName,
    };
  } catch (error) {
    console.error("AI SCRIPT GENERATION ERROR:", {
      message: error.message,
      status: error.status || error.statusCode,
      model: modelName,
    });

    if (
      error.message?.includes("invalid JSON") ||
      error.message?.includes("incomplete script")
    ) {
      throw error;
    }

    throw new Error(
      `Script generation failed using ${modelName}: ${error.message}`
    );
  }
};

module.exports = { generateScriptFromAI };
