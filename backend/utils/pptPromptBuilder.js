const buildPPTPrompt = ({
  topic,
  title,
  slideCount = 6,
  audience = "college students",
  research = null,
}) => {
  const researchBlock = research?.summary
    ? `
Use the following real, current reference information about the topic to
keep your content accurate and up to date. Do not copy it word for word —
rephrase it in your own words and use it to inform facts, figures and
examples on relevant slides:

"""
${research.summary}
"""
`
    : "";

  return `
Create a professional, visually engaging PowerPoint presentation.

Topic: ${topic}
Title: ${title || topic}
Number of slides: ${slideCount}
Audience: ${audience}
${researchBlock}
Return ONLY valid JSON, no markdown, no code fences, matching this exact shape:

{
  "title": "Presentation title",
  "slides": [
    {
      "title": "Slide title",
      "type": "bullets",
      "content": ["Point 1", "Point 2", "Point 3"],
      "imagePrompt": "A short, vivid visual description for an illustration for this slide"
    },
    {
      "title": "Slide title",
      "type": "chart",
      "content": ["One-line summary of what the chart shows"],
      "chart": {
        "chartType": "bar",
        "categories": ["Category A", "Category B", "Category C"],
        "series": [{ "name": "Series name", "values": [10, 20, 30] }]
      }
    },
    {
      "title": "Slide title",
      "type": "process",
      "content": ["One-line summary of the process"],
      "steps": [
        { "label": "Step 1", "description": "Short description" },
        { "label": "Step 2", "description": "Short description" }
      ]
    },
    {
      "title": "Slide title",
      "type": "comparison",
      "content": ["One-line summary of the comparison"],
      "columns": [
        { "heading": "Option A", "points": ["Point 1", "Point 2"] },
        { "heading": "Option B", "points": ["Point 1", "Point 2"] }
      ]
    },
    {
      "title": "Slide title",
      "type": "stats",
      "content": ["One-line context for the statistic"],
      "stat": { "value": "92%", "label": "What this number represents" }
    }
  ]
}

Rules:
- Create exactly ${slideCount} slides.
- "type" must be exactly one of: "bullets", "chart", "process", "comparison", "stats".
- Every slide MUST always include a non-empty "content" array of 1 to 5 short strings, regardless of its type — this is used as a fallback summary.
- For "bullets" and "stats" slides, also include an "imagePrompt": a short (under 20 words), concrete, visual description suitable for an AI image generator to illustrate that slide (e.g. "a modern solar panel farm under a bright blue sky, digital art"). Do not describe text, charts, diagrams, logos, or real named people/brands in the image prompt — describe a generic, tasteful, professional illustration only.
- Use "bullets" for most slides (introduction, explanations, conclusion).
- Include AT LEAST one "chart" slide when the topic has any numeric, statistical, market-size, growth, or comparative data — invent realistic, clearly-labeled illustrative figures only if real numbers are not supplied, and do not present them as verified data.
- Include AT LEAST one "process" slide (3 to 5 steps) when the topic involves a sequence, workflow, lifecycle, or steps.
- Use "comparison" only when there are exactly two clear things to contrast (pros/cons, before/after, option A vs B).
- Use "stats" sparingly, only for one standout number worth highlighting on its own slide.
- If the topic doesn't naturally support chart/process/comparison/stats slides, use "bullets" for all slides instead — never force irrelevant data or diagrams.
- Keep all text concise; each bullet or description should be short enough to read comfortably on a slide.
- Do not use markdown formatting or code fences anywhere in the output.
- Create a logical flow: introduction -> main content -> conclusion.
- Adapt vocabulary and complexity to the target audience: ${audience}.
- Use only information relevant to the supplied topic; do not include unnecessary disclaimers or meta-commentary.
- If the topic is a product, focus on its features, benefits, and use cases.
`;
};

module.exports = {
  buildPPTPrompt,
};
