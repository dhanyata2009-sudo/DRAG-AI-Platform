
const { generateScriptFromAI } = require("./aiService");

const createMarketingScript = async (projectData) => {
  const requiredFields = [
    ["Project Name", projectData.projectName],
    ["Product Name", projectData.productName],
    ["Brand Name", projectData.brandName],
    ["Product Description", projectData.productDescription],
    ["Target Audience", projectData.targetAudience],
    ["Marketing Goal", projectData.marketingGoal],
    ["Platform", projectData.platform],
    ["Ad Style", projectData.adStyle],
    ["Tone", projectData.tone],
    ["Language", projectData.language],
    ["Video Duration", projectData.videoDuration],
    ["Call To Action", projectData.callToAction],
  ];

  const missing = requiredFields.find(
    ([, value]) =>
      value === undefined ||
      value === null ||
      String(value).trim() === ""
  );

  if (missing) {
    return {
      success: false,
      message: `${missing[0]} is required.`,
    };
  }

  const result = await generateScriptFromAI(projectData);

  if (!result || typeof result !== "object") {
    throw new Error("AI generation returned an invalid response.");
  }

  const script = result.script || result.generatedScript;
  const rawScenes = result.scenes || result.scenePlan;

  if (typeof script !== "string" || !script.trim()) {
    throw new Error("AI generation did not return a valid spoken script.");
  }

  if (!Array.isArray(rawScenes) || rawScenes.length === 0) {
    throw new Error(
      "AI generation did not return a valid scene plan. Please try again."
    );
  }

  const scenes = rawScenes.map((scene, index) => {
    const spokenText =
      scene.spokenText || scene.narration || scene.voiceover || "";

    const description =
      scene.description || scene.visualDescription || "";

    const type =
      scene.type ||
      (index % 2 === 0 ? "presenter" : "product_broll");

    return {
      ...scene,
      scene: scene.scene || index + 1,
      type: ["presenter", "product_broll"].includes(type)
        ? type
        : "presenter",
      spokenText: String(spokenText).trim(),
      caption: String(scene.caption || description || spokenText).trim(),
      description: String(description).trim(),
    };
  });

  if (scenes.some((scene) => !scene.spokenText || !scene.caption)) {
    throw new Error(
      "The generated scenes are missing narration or captions."
    );
  }

  return {
    success: true,
    message: "Advertisement script and scene plan generated successfully",
    prompt: result.prompt,
    script: script.trim(),
    scenes,
    generatedScript: script.trim(),
    scenePlan: scenes,
    generationModel: result.model || "Gemini",
    fallbackUsed: result.fallbackUsed || false,
    warning: result.warning,
  };
};

module.exports = { createMarketingScript };
