
require("dotenv").config();

const { generateScriptFromAI } = require("./services/aiService");

const testProduct = {
  projectName: "Test Advertisement",
  brandName: "GlowUp",
  productName: "Face Moisturizer",
  productDescription:
    "A lightweight daily moisturizer designed to keep skin hydrated.",
  targetAudience: "Young adults",
  marketingGoal: "Increase product awareness",
  platform: "Instagram",
  adStyle: "UGC",
  tone: "Friendly and natural",
  language: "English",
  voice: "Female",
  videoDuration: "30 seconds",
  callToAction: "Discover it today!"
};

async function testGemini() {
  try {
    console.log("Testing Gemini script and scene generation...");

    const result = await generateScriptFromAI(testProduct);

    console.log("\n✅ GEMINI GENERATION SUCCESSFUL");
    console.log("\nGenerated script:\n", result.generatedScript);
    console.log("\nScene plan:\n");
    console.dir(result.scenePlan, { depth: null });

    if (!result.generatedScript || !result.scenePlan?.length) {
      throw new Error("Script or scene plan is empty.");
    }

    console.log("\n✅ Script and scene plan are present.");
  } catch (error) {
    console.error("\n❌ GEMINI TEST FAILED");
    console.error(error.message);
  }
}

testGemini();
