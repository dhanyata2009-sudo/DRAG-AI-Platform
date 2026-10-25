
const buildPrompt = (projectData) => {
  return `
You are a senior UGC creative director and realistic short-form ad scriptwriter.
Create a believable creator-made product demo, not a generic commercial.

PROJECT DETAILS
Project Name: ${projectData.projectName || ""}
Brand: ${projectData.brandName || ""}
Product: ${projectData.productName || ""}
Description: ${projectData.productDescription || ""}
Target Audience: ${projectData.targetAudience || ""}
Marketing Goal: ${projectData.marketingGoal || ""}
Platform: ${projectData.platform || "Instagram Reels"}
Ad Style: ${projectData.adStyle || "UGC review"}
Tone: ${projectData.tone || "friendly and authentic"}
Language: ${projectData.language || "English"}
Voice Style: ${projectData.voice || "natural conversational"}
Requested Duration: ${projectData.videoDuration || "15 seconds"}
Call To Action: ${projectData.callToAction || "Learn more"}

CREATIVE GOAL
Write a natural spoken script and a practical visual plan that a
video-generation model can actually stage in one continuous vertical
phone-camera shot. The presenter should demonstrate the product where
safe and physically plausible, rather than merely holding it up.

REALISM RULES
1. Sound like a real person casually sharing a useful discovery with
a friend. Use short conversational sentences, not corporate language,
exaggerated hype, robotic phrases, or repeated product-name mentions.

2. Fit the requested duration at a normal speaking pace. For a
15-second ad, aim for about 28–38 words.

3. Base claims only on the supplied product description. Never invent
ingredients, clinical results, prices, discounts, personal experiences,
guarantees, or performance claims.

4. Choose a realistic action for the actual product category:
- Skincare: open the container, dispense a small amount, gently apply it.
- Perfume: spray once on the wrist and react naturally.
- Drink or food: open, pour, or take a small taste when appropriate.
- Electronics: press a button or demonstrate a plausible feature.
- Clothing or accessories: wear, adjust, or demonstrate a functional detail.

These are examples, not mandatory actions. Choose only actions appropriate
to the product. If its intended use is unclear, demonstrate a relevant
product detail instead.

5. Keep actions simple, visible, safe, and physically possible within
the available duration.

6. Maintain continuity: one presenter, one consistent product, believable
hand positions, no teleporting objects, no changing packaging, and no
impossible hand movements. Use the uploaded product image as the visual
reference.

7. Make every scene concrete and filmable. Specify what the presenter
does, what the camera sees, and when the product is visible.

8. Prefer a natural sequence: quick hook, hands-on demonstration,
a benefit supported by the supplied information, and a simple CTA.
Prefer one continuous shot instead of rapid cuts or multiple locations.

9. Do not invent personal testimonials. Do not say "I use this every day"
or imply real personal experience unless explicitly provided.

OUTPUT REQUIREMENTS
Return one valid JSON object only, with no Markdown fences or explanations.

Use this structure:
{
  "script": "Only the complete words spoken aloud",
  "scenes": [
    {
      "id": 1,
      "type": "presenter",
      "purpose": "Hook and introduction",
      "spokenText": "Exact consecutive words from the full script",
      "visualPrompt": "Concrete presenter action and camera framing",
      "physicalAction": "One simple visible product action",
      "caption": "Short optional caption"
    }
  ]
}

SCRIPT RULES
- The script contains spoken dialogue only. No stage directions,
  headings, brackets, or production notes.
- Start with a specific, natural hook related to the product or need.
- Include a genuine-feeling demonstration without unsupported claims.
- End with this call-to-action idea: ${
    projectData.callToAction || "Learn more"
  }.
- Use the requested language and tone.

SCENE RULES
- Return 2–4 concise ordered beats suitable for a 5–15 second
  presenter-led video.
- Use only type "presenter", because the current pipeline generates
  one presenter-led reference-to-video clip.
- Each spokenText must be an exact consecutive portion of the full
  script. Together they must reproduce the script in order.
- Each visualPrompt must describe a plausible physical action, natural
  expression, camera framing, and product visibility.
- Each physicalAction must be short and concrete.
- Keep captions short and optional.
- Never instruct the presenter to perform an inappropriate, unsafe,
  impossible, or unsupported action.

Return valid JSON matching this structure.
`;
};

module.exports = { buildPrompt };
 