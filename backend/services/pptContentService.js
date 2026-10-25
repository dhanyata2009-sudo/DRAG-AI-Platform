const { GoogleGenerativeAI } = require("@google/generative-ai");
const { buildPPTPrompt } = require("../utils/pptPromptBuilder");
const { fetchTopicResearch } = require("./researchService");
const { generateWithOpenSourceModel } = require("./openSourceAiService");

const getGeminiModel = () => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return genAI.getGenerativeModel({ model: "gemini-3.6-flash" });
};

const VALID_TYPES = ["bullets", "chart", "process", "comparison", "stats"];
const VALID_CHART_TYPES = ["bar", "line", "pie", "doughnut"];

// Pull the JSON object out of a model response even if it added stray
// text, markdown fences, or trailing commentary around it.
const extractJSON = (text) => {
  const cleaned = String(text || "")
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (_err) {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
      return JSON.parse(cleaned.slice(start, end + 1));
    }
    throw new Error("Model response did not contain valid JSON");
  }
};

// Make sure every slide has the fields the renderer expects, and strip
// out any rich data (chart/steps/columns/stat) that is malformed so the
// file generator never crashes on unexpected AI output.
const sanitizeSlide = (rawSlide, index) => {
  const slide = rawSlide && typeof rawSlide === "object" ? rawSlide : {};

  const title = String(slide.title || `Slide ${index + 1}`).trim();

  let type = VALID_TYPES.includes(slide.type) ? slide.type : "bullets";

  const content = Array.isArray(slide.content)
    ? slide.content
        .filter((point) => point !== null && point !== undefined && String(point).trim())
        .map((point) => String(point).trim())
        .slice(0, 6)
    : [];

  const sanitized = { title, type, content };

  const imagePrompt = String(slide.imagePrompt || "").trim();
  if (imagePrompt) {
    sanitized.imagePrompt = imagePrompt.slice(0, 250);
  }

  if (type === "chart") {
    const chart = slide.chart || {};
    const categories = Array.isArray(chart.categories)
      ? chart.categories.map((c) => String(c)).slice(0, 8)
      : [];
    const series = Array.isArray(chart.series)
      ? chart.series
          .filter((s) => s && Array.isArray(s.values))
          .map((s) => ({
            name: String(s.name || "Series"),
            values: s.values.map((v) => Number(v)).filter((v) => !Number.isNaN(v)),
          }))
      : [];

    const chartType = VALID_CHART_TYPES.includes(chart.chartType) ? chart.chartType : "bar";

    if (categories.length >= 2 && series.length >= 1 && series[0].values.length === categories.length) {
      sanitized.chart = { chartType, categories, series };
    } else {
      sanitized.type = "bullets"; // invalid chart data -> safe fallback
    }
  }

  if (type === "process") {
    const steps = Array.isArray(slide.steps)
      ? slide.steps
          .filter((s) => s && s.label)
          .map((s) => ({
            label: String(s.label).trim(),
            description: String(s.description || "").trim(),
          }))
          .slice(0, 5)
      : [];

    if (steps.length >= 2) {
      sanitized.steps = steps;
    } else {
      sanitized.type = "bullets";
    }
  }

  if (type === "comparison") {
    const columns = Array.isArray(slide.columns)
      ? slide.columns
          .filter((c) => c && c.heading)
          .map((c) => ({
            heading: String(c.heading).trim(),
            points: Array.isArray(c.points)
              ? c.points.filter(Boolean).map((p) => String(p).trim()).slice(0, 5)
              : [],
          }))
          .slice(0, 2)
      : [];

    if (columns.length === 2) {
      sanitized.columns = columns;
    } else {
      sanitized.type = "bullets";
    }
  }

  if (type === "stats") {
    const stat = slide.stat || {};
    if (stat.value) {
      sanitized.stat = {
        value: String(stat.value).trim(),
        label: String(stat.label || "").trim(),
      };
    } else {
      sanitized.type = "bullets";
    }
  }

  // Every slide always needs at least some content, even rich ones —
  // used as speaker-note-style fallback and for the in-app preview.
  if (sanitized.content.length === 0) {
    sanitized.content = [title];
  }

  return sanitized;
};

const sanitizePresentation = (raw, fallbackTitle) => {
  const title = String(raw?.title || fallbackTitle || "AI Presentation").trim();
  const slidesInput = Array.isArray(raw?.slides) ? raw.slides : [];

  if (slidesInput.length === 0) {
    throw new Error("Model response contained no slides");
  }

  const slides = slidesInput.map(sanitizeSlide);
  return { title, slides };
};

// Deterministic, AI-free presentation used only if the Gemini call fails
// (missing/invalid API key, quota exceeded, network error, bad JSON,
// etc.) — guarantees PPT generation always succeeds for the user.
const buildFallbackPresentation = (data, research) => {
  const topic = data.topic || "Untitled Topic";
  const audience = data.audience || "General audience";
  const title = data.title || topic;
  const slideCount = Math.max(4, Number(data.slideCount) || 6);

  const researchPoints = research?.summary
    ? research.summary
        .split(/(?<=[.!?])\s+/)
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 4)
    : [];

  const slides = [
    {
      title: "Introduction",
      type: "bullets",
      content: [
        `Overview of ${topic}`,
        `Prepared for ${audience}`,
        ...(researchPoints[0] ? [researchPoints[0]] : []),
      ],
      imagePrompt: `${topic}, professional illustration, clean minimalist digital art`,
    },
    {
      title: "Key Background",
      type: "bullets",
      content: researchPoints.length
        ? researchPoints
        : [
            `${topic} is an important subject for ${audience}`,
            "This section covers the essential context",
            "Understanding the fundamentals sets up the rest of the presentation",
          ],
    },
    {
      title: "How It Works",
      type: "process",
      content: [`A simple step-by-step view of ${topic}`],
      steps: [
        { label: "Step 1", description: "Understand the core idea" },
        { label: "Step 2", description: "Identify the key components" },
        { label: "Step 3", description: "See how they work together" },
        { label: "Step 4", description: "Apply it in practice" },
      ],
    },
    {
      title: "Illustrative Overview",
      type: "chart",
      content: ["An illustrative breakdown to visualize scale (approximate figures)"],
      chart: {
        chartType: "bar",
        categories: ["Area 1", "Area 2", "Area 3", "Area 4"],
        series: [{ name: topic, values: [40, 65, 55, 80] }],
      },
    },
    {
      title: "Conclusion",
      type: "bullets",
      content: [
        `${topic} offers real value for ${audience}`,
        "Key takeaways should guide next steps",
        "Thank you for your attention",
      ],
    },
  ];

  while (slides.length < slideCount) {
    slides.splice(slides.length - 1, 0, {
      title: `More on ${topic}`,
      type: "bullets",
      content: [`Additional detail about ${topic}`, "Relevant to the target audience", "Supports the overall narrative"],
    });
  }

  return { title, slides: slides.slice(0, slideCount), source: "fallback" };
};

// Content generation is attempted in this order, each one purely
// best-effort: an open-source model is preferred by default; Gemini is
// kept only as an optional secondary path for anyone who already has a
// GEMINI_API_KEY configured; the deterministic generator never fails.
const buildProviderChain = () => {
  const chain = [];

  if (process.env.HF_TOKEN) {
    chain.push({ name: "open-source (Hugging Face)", call: generateWithOpenSourceModel });
  }

  if (process.env.GEMINI_API_KEY) {
    chain.push({
      name: "gemini",
      call: async (prompt) => {
        const result = await getGeminiModel().generateContent(prompt);
        return result.response.text();
      },
    });
  }

  return chain;
};

const generatePPTContent = async (data) => {
  const research = await fetchTopicResearch(data.topic);
  const prompt = buildPPTPrompt({ ...data, research });
  const providers = buildProviderChain();
  const researchMeta = research ? { title: research.title, url: research.url } : null;

  for (const provider of providers) {
    try {
      const text = await provider.call(prompt);
      const parsed = extractJSON(text);
      const presentation = sanitizePresentation(parsed, data.title || data.topic);
      presentation.source = provider.name;
      presentation.research = researchMeta;
      return presentation;
    } catch (error) {
      console.error(`PPT generation via ${provider.name} failed, trying next option:`, error.message);
      // fall through to the next provider (or the deterministic fallback)
    }
  }

  const fallback = buildFallbackPresentation(data, research);
  fallback.research = researchMeta;
  return fallback;
};

module.exports = {
  generatePPTContent,
};
