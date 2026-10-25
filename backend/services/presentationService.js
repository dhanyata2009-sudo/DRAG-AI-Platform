/**
 * DRAG.ai — Presentation Engine (single-file replacement)
 * --------------------------------------------------------------------------
 * Drop-in replacement for: backend/services/presentationService.js
 * Same export:  generatePresentation(data) -> { title, slides, fileName, source, research, ... }
 * No new npm packages required (uses pptxgenjs + axios you already have).
 *
 * What it does
 *  1. Research      : Wikipedia facts + lead image (keyless, best effort)
 *  2. Outline       : AI plans N DISTINCT slides (one unique "angle" per slide)
 *  3. Content       : written in small batches; every batch is told what earlier
 *                     slides already said, so nothing repeats on long decks
 *  4. Anti-repeat   : similarity check on every title/bullet/card/step; duplicates
 *                     are removed, weak slides are re-written, last resort = unused facts
 *  5. Images        : Hugging Face text-to-image (cover + visual + split slides),
 *                     parallel, time-boxed, Wikipedia image fallback for the cover
 *  6. Rendering     : 12 designed layouts, 6 colour themes, native editable charts,
 *                     speaker notes, varied rhythm (no two identical layouts in a row x3)
 *
 * Slide count = TOTAL slides in the file (cover + agenda + content + closing).
 *
 * Optional .env knobs (all optional)
 *   HF_TOKEN, HF_MODEL (default meta-llama/Llama-3.1-8B-Instruct), HF_IMAGE_MODEL,
 *   GEMINI_API_KEY, GEMINI_MODEL, PPT_MAX_SLIDES (30), PPT_MAX_IMAGES (8),
 *   PPT_IMAGE_BUDGET_MS (110000), PPT_THEME (auto|midnight|ocean|sunset|forest|crimson|mono)
 *
 * Optional per-request controls (pass as req.body.options, or flat on the body):
 *   { theme, tone, language, includeImages, maxImages, includeNotes, includeAgenda,
 *     imageStyle, extraNotes }
 */
const pptxgen = require("pptxgenjs");
const axios = require("axios");

/* ========================================================================== *
 * 1. CONFIG + THEMES
 * ========================================================================== */
const W = 13.333;
const H = 7.5;
const MAX_SLIDES = Number(process.env.PPT_MAX_SLIDES) || 30;
const MIN_SLIDES = 3;

const THEMES = {
  midnight: { dark: "0B1020", bg: "F6F7FB", ink: "0F172A", muted: "5B6478", primary: "4F46E5", secondary: "06B6D4", accent: "F59E0B", chart: ["4F46E5", "06B6D4", "F59E0B", "EC4899", "10B981"], head: "Georgia", body: "Calibri" },
  ocean:    { dark: "062B3F", bg: "F2F8FB", ink: "0B2533", muted: "4F6B7A", primary: "0EA5E9", secondary: "14B8A6", accent: "F97316", chart: ["0EA5E9", "14B8A6", "F97316", "6366F1", "84CC16"], head: "Trebuchet MS", body: "Calibri" },
  sunset:   { dark: "2A1233", bg: "FFF8F3", ink: "2B1B2E", muted: "715B70", primary: "E4572E", secondary: "A23B72", accent: "F6AE2D", chart: ["E4572E", "A23B72", "F6AE2D", "2E86AB", "76B041"], head: "Georgia", body: "Calibri" },
  forest:   { dark: "0F2D24", bg: "F5F8F3", ink: "10241D", muted: "52665D", primary: "15803D", secondary: "0D9488", accent: "EAB308", chart: ["15803D", "0D9488", "EAB308", "65A30D", "0284C7"], head: "Trebuchet MS", body: "Calibri" },
  crimson:  { dark: "1F1317", bg: "FBF7F5", ink: "261519", muted: "6E5A5E", primary: "BE123C", secondary: "7C3AED", accent: "F59E0B", chart: ["BE123C", "7C3AED", "F59E0B", "0EA5E9", "10B981"], head: "Georgia", body: "Calibri" },
  mono:     { dark: "111111", bg: "F7F7F5", ink: "151515", muted: "62625E", primary: "1F2937", secondary: "6B7280", accent: "FF4D2E", chart: ["1F2937", "FF4D2E", "6B7280", "9CA3AF", "D97706"], head: "Georgia", body: "Calibri" },
};

const THEME_HINTS = [
  [/health|medic|bio|nature|environment|green|climate|agri|sustain|plant|ecolog/i, "forest"],
  [/ocean|water|sea|travel|space|science|physics|data|cloud|network|ai\b|machine/i, "ocean"],
  [/food|art|design|fashion|culture|festival|music|film|creative|brand|marketing/i, "sunset"],
  [/history|war|law|politic|finance|bank|invest|econom|business|market/i, "crimson"],
  [/minimal|architect|photo|mobile|phone|iphone|apple|device|gadget|tech|software|startup/i, "midnight"],
];

const pickTheme = (topic, requested) => {
  const want = String(requested || process.env.PPT_THEME || "auto").toLowerCase();
  if (THEMES[want]) return want;
  for (const [re, name] of THEME_HINTS) if (re.test(topic || "")) return name;
  const names = Object.keys(THEMES);
  let h = 0;
  for (const ch of String(topic || "x")) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return names[h % names.length];
};

const mix = (a, b, t) => {
  const pa = [0, 2, 4].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [0, 2, 4].map((i) => parseInt(b.slice(i, i + 2), 16));
  return pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, "0")).join("").toUpperCase();
};

const buildTheme = (name) => {
  const t = THEMES[name];
  return { ...t, name, white: "FFFFFF", soft: mix(t.primary, "FFFFFF", 0.9), line: mix(t.ink, "FFFFFF", 0.88), darkMuted: mix(t.dark, "FFFFFF", 0.62) };
};

const MID_TYPES = ["bullets", "cards", "stats", "chart", "process", "timeline", "comparison", "spotlight", "visual"];

/* ========================================================================== *
 * 2. TEXT UTILITIES (cleaning, similarity, fitting)
 * ========================================================================== */
const str = (v) => (v === null || v === undefined ? "" : String(v)).replace(/\s+/g, " ").trim();
const clamp = (n, a, b) => Math.min(b, Math.max(a, n));

// Trim to max chars at a word boundary (never mid-word), no trailing punctuation clutter.
const cut = (text, max) => {
  const t = str(text);
  if (t.length <= max) return t;
  const slice = t.slice(0, max);
  const sp = slice.lastIndexOf(" ");
  return (sp > max * 0.6 ? slice.slice(0, sp) : slice).replace(/[\s,;:–—-]+$/, "") + "…";
};

const STOP = new Set("a an the and or but of to in on for with at by from as is are was were be been it its this that these those you your we our they their can will may more most very into than then also not no so such over about how what why when where which who".split(" "));
const stem = (w) => w.replace(/(ing|edly|ed|es|s|ly)$/i, "");
const tokens = (text) =>
  new Set(str(text).toLowerCase().replace(/[^a-z0-9\u00C0-\uFFFF\s]/g, " ").split(" ").filter((w) => w.length > 2 && !STOP.has(w)).map(stem));

const similarity = (a, b) => {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  a.forEach((w) => b.has(w) && (inter += 1));
  const jac = inter / (a.size + b.size - inter);
  const contain = Math.min(a.size, b.size) >= 4 ? inter / Math.min(a.size, b.size) : 0;
  return Math.max(jac, contain * 0.9);
};

// Estimate the largest font size (pt) that lets the texts fit inside a w x h (inches) box.
const fitFont = (texts, w, h, max, min, { cw = 0.0074, gap = 0 } = {}) => {
  const list = (Array.isArray(texts) ? texts : [texts]).map(str);
  for (let pt = max; pt >= min; pt -= 1) {
    const perLine = Math.max(1, Math.floor(w / (pt * cw)));
    const lines = list.reduce((n, t) => n + Math.max(1, Math.ceil(t.length / perLine)), 0);
    if ((lines * pt * 1.22 + list.length * gap) / 72 <= h) return pt;
  }
  return min;
};

const splitSentences = (text) =>
  str(text).split(/(?<=[.!?])\s+(?=[A-Z0-9"“])/).map((s) => s.trim()).filter((s) => s.length > 25 && s.length < 260);

/* ========================================================================== *
 * 3. RESEARCH (Wikipedia, keyless, never throws)
 * ========================================================================== */
const WIKI_API = "https://en.wikipedia.org/w/api.php";

const fetchResearch = async (topic) => {
  const q = str(topic);
  if (!q) return null;
  try {
    const search = await axios.get(WIKI_API, {
      timeout: 6000,
      params: { action: "query", list: "search", srsearch: q, format: "json", srlimit: 1, origin: "*" },
    });
    const title = search.data?.query?.search?.[0]?.title;
    if (!title) return null;

    const { data } = await axios.get(WIKI_API, {
      timeout: 8000,
      params: {
        action: "query", prop: "extracts|pageimages|info", inprop: "url", titles: title, redirects: 1,
        explaintext: 1, exsectionformat: "plain", piprop: "thumbnail", pithumbsize: 1280, format: "json", origin: "*",
      },
    });
    const page = Object.values(data?.query?.pages || {})[0];
    const text = str(page?.extract).slice(0, 6000);
    if (!text) return null;
    return {
      title: page.title,
      url: page.fullurl || null,
      imageUrl: page.thumbnail?.source || null,
      text,
      sentences: splitSentences(text),
    };
  } catch (_e) {
    return null;
  }
};

/* ========================================================================== *
 * 4. LLM PROVIDERS (open-source via Hugging Face first, Gemini optional)
 * ========================================================================== */
const extractJSON = (raw) => {
  const cleaned = String(raw || "").replace(/```json/gi, "").replace(/```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch (_e) {
    const s = cleaned.indexOf("{");
    const e = cleaned.lastIndexOf("}");
    if (s !== -1 && e > s) return JSON.parse(cleaned.slice(s, e + 1).replace(/,\s*([}\]])/g, "$1"));
    throw new Error("No valid JSON in model response");
  }
};

const hfChat = async (prompt, maxTokens) => {
  const res = await axios.post(
    "https://router.huggingface.co/v1/chat/completions",
    {
      model: process.env.HF_MODEL || "meta-llama/Llama-3.1-8B-Instruct",
      messages: [
        { role: "system", content: "You are an expert presentation writer. You reply with ONE valid JSON object only: no markdown, no commentary." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: maxTokens,
    },
    { timeout: 90000, headers: { Authorization: `Bearer ${process.env.HF_TOKEN}`, "Content-Type": "application/json" } }
  );
  const text = res.data?.choices?.[0]?.message?.content;
  if (!text) throw new Error("Empty response from Hugging Face model");
  return text;
};

const geminiChat = async (prompt, maxTokens) => {
  const { GoogleGenerativeAI } = require("@google/generative-ai");
  const model = new GoogleGenerativeAI(process.env.GEMINI_API_KEY).getGenerativeModel({
    model: process.env.GEMINI_MODEL || "gemini-3.6-flash",
    generationConfig: { responseMimeType: "application/json", maxOutputTokens: maxTokens, temperature: 0.7 },
  });
  const result = await model.generateContent(prompt);
  return result.response.text();
};

const providers = () => {
  const list = [];
  if (process.env.HF_TOKEN) list.push({ name: "open-source (Hugging Face)", call: hfChat });
  if (process.env.GEMINI_API_KEY) list.push({ name: "gemini", call: geminiChat });
  return list;
};

// Ask for JSON; try each provider (2 attempts each). Returns { data, provider } or null.
const askJSON = async (prompt, maxTokens = 3500) => {
  for (const p of providers()) {
    for (let attempt = 1; attempt <= 2; attempt += 1) {
      try {
        const data = extractJSON(await p.call(prompt, maxTokens));
        return { data, provider: p.name };
      } catch (err) {
        console.error(`[ppt] ${p.name} attempt ${attempt} failed: ${err.message}`);
      }
    }
  }
  return null;
};

/* ========================================================================== *
 * 5. PROMPTS
 * ========================================================================== */
const SCHEMAS = {
  bullets: `"content": ["3-5 DIFFERENT concrete points, 8-22 words each, each carrying a fact/example/benefit"], "imagePrompt": "vivid 10-20 word scene description, no text/logos/real people"`,
  cards: `"cards": [{"heading": "2-4 words", "text": "12-25 words"}] (3 or 4 cards), "content": ["one-line summary"]`,
  stats: `"stats": [{"value": "short number e.g. 92% / 3x / 12M", "label": "what it measures (max 8 words)", "note": "max 14 words of context"}] (2-4 items), "content": ["one-line takeaway"]`,
  chart: `"chart": {"chartType": "bar|line|pie|doughnut", "categories": ["3-6 labels"], "series": [{"name": "Series", "values": [numbers, same length as categories]}], "note": "unit/source e.g. 'Illustrative figures, %'"}, "content": ["2-3 insight sentences interpreting the chart"]`,
  process: `"steps": [{"label": "2-4 words", "description": "10-20 words"}] (3-5 steps), "content": ["one-line summary"]`,
  timeline: `"events": [{"label": "year / phase / stage", "description": "10-20 words"}] (3-6 events in order), "content": ["one-line summary"]`,
  comparison: `"columns": [{"heading": "Option A", "points": ["3-4 short points"]}, {"heading": "Option B", "points": ["3-4 short points"]}], "content": ["one-line verdict"]`,
  spotlight: `"statement": "ONE bold, memorable sentence, max 22 words", "content": ["2-3 supporting points, 8-18 words each"]`,
  visual: `"caption": "one evocative sentence, max 18 words", "content": ["0-2 short supporting points"], "imagePrompt": "vivid 10-20 word scene description, no text/logos/real people"`,
  closing: `"content": ["3-4 key takeaways, each a different lesson, max 16 words"], "cta": "short closing line, max 10 words"`,
};

const commonRules = (o) => `
Topic: ${o.topic}
Presentation title: ${o.title}
Audience: ${o.audience}
Tone: ${o.tone}
Language: ${o.language}
${o.extraNotes ? `Presenter notes to honour: ${o.extraNotes}\n` : ""}${
  o.research?.text ? `\nReference facts (rephrase, never copy; may be partial):\n"""\n${o.research.text.slice(0, 3200)}\n"""\n` : ""
}
Quality rules:
- Be specific: real facts, concrete examples, named features, numbers only when you are confident.
- If you are NOT sure about exact specs, prices, dates or figures (e.g. very recent products), describe them qualitatively or say "expected"/"reported". Never invent precise specifications.
- Write for ${o.audience}: simple, vivid, no jargon without explanation.
- Short, scannable text. No markdown, no emojis, no filler like "In conclusion" or "As we can see".
- NEVER repeat an idea, fact, example or sentence that appears on another slide.`;

const outlinePrompt = (o, count) => `
${commonRules(o)}

Plan the storyline of a presentation. Return JSON:
{
  "title": "sharp presentation title (max 8 words)",
  "subtitle": "one-line promise of the talk (max 16 words)",
  "theme": "one of: midnight, ocean, sunset, forest, crimson, mono",
  "slides": [
    { "section": "short chapter name (2-3 words, reused across related slides, 3-5 chapters in total)",
      "title": "specific slide title (max 7 words)",
      "angle": "the ONE unique question or idea this slide answers, in one sentence — must differ from every other slide",
      "type": "${MID_TYPES.join(" | ")}" }
  ]
}
Rules:
- Return exactly ${count} entries in "slides", in a logical narrative order (hook -> context -> core ideas -> proof/examples -> outlook).
- Every "angle" must cover different ground. No two slides may be about the same sub-topic.
- Mix layout types. Use "chart" or "stats" only if numbers make sense, "process" for sequences, "timeline" for history/roadmap, "comparison" for exactly two things, "visual" for an image-led moment, "cards" for 3-4 parallel ideas, "spotlight" for one big idea.
- Never use the same type more than twice in a row.`;

const batchPrompt = (o, batch, covered, includeClosing) => `
${commonRules(o)}

Already covered on previous slides (DO NOT restate, paraphrase or re-use any of it):
${covered.length ? covered.map((c) => `- ${c}`).join("\n") : "- (nothing yet)"}

Write the content for these slides. Each slide must stay strictly inside its own "angle".
${batch.map((s) => `
[#${s.index}] type="${s.type}" | section="${s.section}" | title="${s.title}"
  angle: ${s.angle}
  fields: ${SCHEMAS[s.type]}`).join("\n")}
${includeClosing ? `
[#closing] type="closing" | title="Key takeaways"
  fields: ${SCHEMAS.closing}` : ""}

Every slide object must also include "notes": 2-3 sentences of speaker notes (what the presenter should SAY, with one extra fact not shown on the slide).
Return JSON exactly like: {"slides": [ {"index": <number or "closing">, "title": "...", <fields>, "notes": "..."} ]}
Rules: one object per listed slide; keep "index" identical to the [#id]; numbers in chart values must be plain numbers.`;

/* ========================================================================== *
 * 6. SANITISING  (turn untrusted AI output into safe, typed slides)
 * ========================================================================== */
const list = (v, max, len) =>
  (Array.isArray(v) ? v : []).map((x) => cut(x, len)).filter(Boolean).slice(0, max);

const sanitizeSlide = (raw, plan) => {
  const r = raw && typeof raw === "object" ? raw : {};
  const s = {
    title: cut(r.title || plan.title, 70) || plan.title,
    section: plan.section,
    type: plan.type,
    angle: plan.angle,
    content: list(r.content, 5, 170),
    notes: cut(r.notes, 600),
  };
  const ip = cut(r.imagePrompt, 220);
  if (ip) s.imagePrompt = ip;

  const downgrade = () => { s.type = s.content.length >= 2 ? "bullets" : s.type; s.bad = s.content.length < 2; };

  switch (plan.type) {
    case "cards": {
      s.cards = (Array.isArray(r.cards) ? r.cards : [])
        .filter((c) => c && (c.heading || c.title) && c.text)
        .map((c) => ({ heading: cut(c.heading || c.title, 36), text: cut(c.text, 150) })).slice(0, 4);
      if (s.cards.length < 2) { s.cards = undefined; downgrade(); }
      else if (!s.content.length) s.content = s.cards.map((c) => `${c.heading}: ${c.text}`).slice(0, 4);
      break;
    }
    case "stats": {
      s.stats = (Array.isArray(r.stats) ? r.stats : r.stat ? [r.stat] : [])
        .filter((x) => x && str(x.value))
        .map((x) => ({ value: cut(x.value, 12), label: cut(x.label, 60), note: cut(x.note, 90) })).slice(0, 4);
      if (!s.stats.length) { s.stats = undefined; downgrade(); }
      else { s.stat = { value: s.stats[0].value, label: s.stats[0].label }; if (!s.content.length) s.content = [s.stats[0].label].filter(Boolean); }
      break;
    }
    case "chart": {
      const c = r.chart || {};
      const categories = list(c.categories, 6, 22);
      const series = (Array.isArray(c.series) ? c.series : [])
        .filter((x) => x && Array.isArray(x.values))
        .map((x) => ({ name: cut(x.name || "Series", 30), values: x.values.map(Number).filter((n) => Number.isFinite(n)) })).slice(0, 3);
      const type = ["bar", "line", "pie", "doughnut"].includes(c.chartType) ? c.chartType : "bar";
      const ok = categories.length >= 2 && series.length && series.every((x) => x.values.length === categories.length);
      if (ok) {
        const pie = type === "pie" || type === "doughnut";
        s.chart = { chartType: type, categories, series: pie ? [series[0]] : series, note: cut(c.note || "Illustrative figures", 80) };
      } else downgrade();
      break;
    }
    case "process": {
      s.steps = (Array.isArray(r.steps) ? r.steps : []).filter((x) => x && x.label)
        .map((x) => ({ label: cut(x.label, 32), description: cut(x.description, 120) })).slice(0, 5);
      if (s.steps.length < 2) { s.steps = undefined; downgrade(); }
      break;
    }
    case "timeline": {
      s.events = (Array.isArray(r.events) ? r.events : []).filter((x) => x && x.label)
        .map((x) => ({ label: cut(x.label, 24), description: cut(x.description, 120) })).slice(0, 6);
      if (s.events.length < 2) { s.events = undefined; downgrade(); }
      break;
    }
    case "comparison": {
      s.columns = (Array.isArray(r.columns) ? r.columns : []).filter((x) => x && x.heading)
        .map((x) => ({ heading: cut(x.heading, 30), points: list(x.points, 4, 90) })).slice(0, 2);
      if (s.columns.length !== 2 || s.columns.some((x) => x.points.length < 2)) { s.columns = undefined; downgrade(); }
      break;
    }
    case "spotlight": {
      s.statement = cut(r.statement || r.caption, 170);
      if (!s.statement) { if (s.content.length) s.statement = s.content.shift(); else s.bad = true; }
      break;
    }
    case "visual": {
      s.caption = cut(r.caption || r.statement, 140);
      if (!s.caption && s.content.length) s.caption = s.content.shift();
      if (!s.caption) s.bad = true;
      break;
    }
    default: // bullets
      s.type = "bullets";
      if (s.content.length < 2) s.bad = true;
  }
  if (s.type === "bullets" && s.content.length < 2) s.bad = true;
  return s;
};

/* ========================================================================== *
 * 7. ANTI-REPETITION ENGINE
 * ========================================================================== */
const DUP_THRESHOLD = 0.6;
const TITLE_THRESHOLD = 0.72;

// every user-visible string of a slide, grouped so duplicates can be removed precisely
const slideTexts = (s) => {
  const out = [];
  (s.content || []).forEach((t) => out.push(t));
  (s.cards || []).forEach((c) => out.push(`${c.heading} ${c.text}`));
  (s.steps || []).forEach((c) => out.push(`${c.label} ${c.description}`));
  (s.events || []).forEach((c) => out.push(`${c.label} ${c.description}`));
  (s.columns || []).forEach((c) => c.points.forEach((p) => out.push(p)));
  (s.stats || []).forEach((c) => out.push(`${c.label} ${c.note}`));
  if (s.statement) out.push(s.statement);
  if (s.caption) out.push(s.caption);
  return out;
};

const isDup = (text, seen, threshold = DUP_THRESHOLD) => {
  const t = tokens(text);
  if (t.size < 3) return false;
  return seen.some((x) => similarity(t, x) >= threshold);
};

const MIN_ITEMS = { bullets: 2, cards: 2, steps: 2, events: 2, points: 2 };

// Removes repeated items. Returns true when the slide is still healthy afterwards.
const dedupeSlide = (s, seen, seenTitles) => {
  let healthy = !s.bad;
  const keep = (arr, textOf, min) => {
    if (!arr) return arr;
    const out = arr.filter((x) => !isDup(textOf(x), seen));
    if (out.length < min) healthy = false;
    return out.length ? out : arr.slice(0, 1);
  };
  s.content = (s.content || []).filter((t) => !isDup(t, seen));
  if (s.type === "bullets" && s.content.length < MIN_ITEMS.bullets) healthy = false;
  if (s.cards) s.cards = keep(s.cards, (c) => `${c.heading} ${c.text}`, MIN_ITEMS.cards);
  if (s.steps) s.steps = keep(s.steps, (c) => `${c.label} ${c.description}`, MIN_ITEMS.steps);
  if (s.events) s.events = keep(s.events, (c) => `${c.label} ${c.description}`, MIN_ITEMS.events);
  if (s.columns) s.columns.forEach((c) => { c.points = keep(c.points, (p) => p, MIN_ITEMS.points); });
  if (s.statement && isDup(s.statement, seen)) healthy = false;
  if (s.caption && isDup(s.caption, seen)) healthy = false;
  if (s.stats && s.stats.length && s.stats.every((x) => isDup(`${x.label} ${x.note}`, seen))) healthy = false;

  const tt = tokens(s.title);
  if (tt.size && seenTitles.some((x) => similarity(tt, x) >= TITLE_THRESHOLD)) { s.retitle = true; healthy = false; }
  s.bad = !healthy;
  return healthy;
};

const registerSlide = (s, seen, seenTitles) => {
  slideTexts(s).forEach((t) => { const k = tokens(t); if (k.size) seen.push(k); });
  seenTitles.push(tokens(s.title));
};

const coveredLines = (slides, limit = 28) => {
  const lines = [];
  slides.forEach((s) => {
    const first = slideTexts(s).slice(0, 2).map((t) => cut(t, 80)).join(" | ");
    lines.push(`"${s.title}": ${first}`);
  });
  return lines.slice(-limit);
};

/* ========================================================================== *
 * 8. PLANNING + CONTENT GENERATION (AI, with deterministic fallback)
 * ========================================================================== */
// Facets give the offline fallback many genuinely different angles.
const FACETS = [
  ["What it is", "bullets", ["{t} explained in plain words for {a}", "The core idea behind {t} and why people talk about it", "A quick snapshot of where {t} stands today"]],
  ["Why it matters", "spotlight", ["{t} changes how people learn, work or live", "Understanding {t} helps {a} make better choices"]],
  ["Key features", "cards", [["Core idea", "The main thing that defines {t}"], ["Everyday use", "How {a} meet {t} in daily life"], ["Standout trait", "What makes {t} different from alternatives"]]],
  ["How it works", "process", [["Start", "The basic building block of {t}"], ["Combine", "How the parts connect together"], ["Deliver", "What the user finally sees or gets"]]],
  ["Who benefits", "bullets", ["Students and learners gain faster access to knowledge through {t}", "Professionals save time by relying on {t}", "Communities benefit when {t} becomes widely available"]],
  ["Real-world examples", "cards", [["At school", "How {t} supports classroom learning"], ["At home", "How {t} fits family routines"], ["Online", "How {t} shows up in digital life"]]],
  ["Strengths and limits", "comparison", [["Strengths", ["Easy to start with", "Useful across many situations", "Keeps improving over time"]], ["Limits", ["Needs good understanding", "Not perfect for every case", "Requires responsible use"]]]],
  ["Growth over time", "chart", null],
  ["Milestones", "timeline", [["Early days", "{t} begins as a simple idea"], ["Growth", "More people adopt and shape {t}"], ["Today", "{t} becomes part of everyday conversation"], ["Next", "New ideas keep pushing {t} forward"]]],
  ["Challenges", "bullets", ["Keeping {t} safe, fair and reliable for everyone", "Balancing excitement with careful, informed decisions", "Making sure {a} understand both benefits and risks"]],
  ["Smart habits", "cards", [["Stay curious", "Ask questions about how {t} really works"], ["Verify", "Check facts from more than one trusted source"], ["Be responsible", "Use {t} in ways that help others too"]]],
  ["Looking ahead", "spotlight", ["The future of {t} will be shaped by people like {a}", "Small ideas today can become big changes tomorrow"]],
];

const fallbackOutline = (o, count) => {
  const plan = [];
  const chapters = ["Foundations", "Deep dive", "In practice", "Outlook"];
  for (let i = 0; i < count; i += 1) {
    const f = FACETS[i % FACETS.length];
    const round = Math.floor(i / FACETS.length);
    plan.push({
      index: i, section: chapters[Math.min(chapters.length - 1, Math.floor((i / count) * chapters.length))],
      title: round ? `${f[0]}: ${["a closer look", "another view", "more detail"][round % 3]}` : f[0],
      angle: `${f[0]} of ${o.topic}`, type: f[1],
    });
  }
  return plan;
};

const fallbackSlide = (plan, o, research, usedFacts) => {
  const f = FACETS.find((x) => x[0] === plan.angle.split(" of ")[0]) || FACETS[plan.index % FACETS.length];
  const fill = (t) => String(t).replace(/\{t\}/g, o.topic).replace(/\{a\}/g, o.audience);
  const raw = { title: plan.title, notes: `Talk through ${plan.title.toLowerCase()} in your own words, linking it to ${o.topic}.` };
  const fact = (research?.sentences || []).find((x) => !usedFacts.has(x));
  if (fact) usedFacts.add(fact);

  switch (f[1]) {
    case "cards": raw.cards = f[2].map(([h, t]) => ({ heading: h, text: fill(t) })); raw.content = [fact || fill(f[2][0][1])]; break;
    case "process": raw.steps = f[2].map(([h, t]) => ({ label: h, description: fill(t) })); raw.content = [fact || ""]; break;
    case "timeline": raw.events = f[2].map(([h, t]) => ({ label: h, description: fill(t) })); raw.content = [fact || ""]; break;
    case "comparison": raw.columns = f[2].map(([h, p]) => ({ heading: h, points: p.map(fill) })); raw.content = [fact || ""]; break;
    case "chart": raw.chart = { chartType: "bar", categories: ["Awareness", "Interest", "Adoption", "Mastery"], series: [{ name: o.topic, values: [35, 55, 70, 85] }], note: "Illustrative figures, %" }; raw.content = [fact || `A simple view of how interest in ${o.topic} can grow`]; break;
    case "spotlight": raw.statement = fill(f[2][0]); raw.content = [...f[2].slice(1).map(fill), ...(fact ? [fact] : [])].slice(0, 3); break;
    default: raw.content = [...(fact ? [fact] : []), ...f[2].map(fill)].slice(0, 4);
  }
  raw.imagePrompt = `${o.topic}, ${plan.title}, modern illustration`;
  const s = sanitizeSlide(raw, { ...plan, type: ["chart", "comparison", "timeline", "process", "cards", "spotlight"].includes(f[1]) ? f[1] : "bullets" });
  s.type = s.type === plan.type ? s.type : s.type; // type may legitimately differ from plan in fallback
  return s;
};

// avoid the same layout three times in a row; keep charts rare; never open with a chart
const diversifyTypes = (plan) => {
  const alt = ["cards", "spotlight", "bullets", "visual", "process"];
  let charts = 0;
  const maxCharts = Math.max(1, Math.ceil(plan.length / 4));
  plan.forEach((p, i) => {
    if (!MID_TYPES.includes(p.type)) p.type = "bullets";
    if (p.type === "chart") { charts += 1; if (charts > maxCharts || i === 0) p.type = "cards"; }
    if (i >= 2 && p.type === plan[i - 1].type && p.type === plan[i - 2].type) {
      p.type = alt.find((t) => t !== p.type && t !== plan[i - 1].type) || "cards";
    }
  });
  return plan;
};

const planDeck = async (o, count) => {
  let ai = null;
  if (providers().length) ai = await askJSON(outlinePrompt(o, count), 2500);

  const rawSlides = Array.isArray(ai?.data?.slides) ? ai.data.slides : [];
  let plan = rawSlides
    .filter((s) => s && (s.title || s.angle))
    .map((s, i) => ({
      index: i,
      section: cut(s.section, 28) || "Overview",
      title: cut(s.title, 70) || `Part ${i + 1}`,
      angle: cut(s.angle || s.title, 200),
      type: MID_TYPES.includes(s.type) ? s.type : "bullets",
    }));

  // unique titles / angles only
  const seenT = [];
  plan = plan.filter((p) => {
    const t = tokens(`${p.title} ${p.angle}`);
    if (seenT.some((x) => similarity(x, t) > 0.7)) return false;
    seenT.push(t);
    return true;
  });

  let source = ai ? ai.provider : "fallback";
  if (plan.length < Math.ceil(count * 0.6)) { plan = fallbackOutline(o, count); source = "fallback"; }
  else if (plan.length > count) plan = plan.slice(0, count);
  else if (plan.length < count) {
    const extra = fallbackOutline(o, count).filter((f) => !plan.some((p) => similarity(tokens(p.title), tokens(f.title)) > 0.6));
    plan = plan.concat(extra.slice(0, count - plan.length));
  }
  plan.forEach((p, i) => { p.index = i; });
  return {
    plan: diversifyTypes(plan),
    title: cut(ai?.data?.title, 80),
    subtitle: cut(ai?.data?.subtitle, 120),
    theme: ai?.data?.theme,
    source,
  };
};

const BATCH_SIZE = 4;

const writeSlides = async (o, plan, research) => {
  const slides = [];
  const seen = [];
  const seenTitles = [];
  const usedFacts = new Set();
  let closing = null;
  let aiUsed = false;
  const canAI = providers().length > 0;

  for (let i = 0; i < plan.length; i += BATCH_SIZE) {
    const batch = plan.slice(i, i + BATCH_SIZE);
    const last = i + BATCH_SIZE >= plan.length;
    let rawBySlot = {};

    if (canAI) {
      const ai = await askJSON(batchPrompt(o, batch, coveredLines(slides), last), 4000);
      if (ai && Array.isArray(ai.data?.slides)) {
        aiUsed = true;
        ai.data.slides.forEach((r) => { if (r) rawBySlot[String(r.index).replace("#", "")] = r; });
      }
    }

    batch.forEach((p) => {
      const raw = rawBySlot[String(p.index)];
      const s = raw ? sanitizeSlide(raw, p) : fallbackSlide(p, o, research, usedFacts);
      s.slot = p.index;
      s.fromFallback = !raw;
      dedupeSlide(s, seen, seenTitles);
      registerSlide(s, seen, seenTitles);   // register even if weak; repaired below
      slides.push(s);
    });
    if (last && rawBySlot.closing) closing = rawBySlot.closing;
  }

  // ---- repair pass: re-write any weak / repeated slide with the full "already said" list ----
  for (let round = 0; round < 2; round += 1) {
    const weak = slides.filter((s) => s.bad);
    if (!weak.length || !canAI) break;
    const others = slides.filter((s) => !s.bad);
    const plans = weak.map((s) => ({ index: s.slot, section: s.section, title: s.retitle ? `${s.title} — new angle` : s.title, angle: s.angle, type: s.type }));
    const ai = await askJSON(batchPrompt(o, plans, coveredLines(others, 40), false) + "\nIMPORTANT: your previous version repeated earlier material. Bring genuinely NEW information.", 4000);
    (ai?.data?.slides || []).forEach((r) => {
      const idx = slides.findIndex((s) => String(s.slot) === String(r?.index).replace("#", ""));
      if (idx === -1) return;
      const old = slides[idx];
      const fresh = sanitizeSlide(r, { index: old.slot, section: old.section, title: old.title, angle: old.angle, type: old.type });
      fresh.slot = old.slot;
      const seenNow = [];
      slides.forEach((s, k) => { if (k !== idx) slideTexts(s).forEach((t) => { const tk = tokens(t); if (tk.size) seenNow.push(tk); }); });
      const titlesNow = slides.filter((_, k) => k !== idx).map((s) => tokens(s.title));
      if (dedupeSlide(fresh, seenNow, titlesNow)) slides[idx] = fresh;
    });
  }

  // ---- last resort: guarantee every slide has unique, non-empty material ----
  slides.forEach((s) => {
    if (!s.bad && slideTexts(s).length) return;
    const fact = (research?.sentences || []).find((x) => !usedFacts.has(x) && !isDup(x, seen, 0.5));
    if (fact) usedFacts.add(fact);
    if (s.type === "bullets" || !slideTexts(s).length) {
      s.content = [...(s.content || []), s.angle, fact].filter(Boolean).slice(0, 4);
      if (s.content.length < 2) s.content.push(`Key idea: ${s.title}`);
      s.type = "bullets";
      delete s.cards; delete s.steps; delete s.events; delete s.columns; delete s.stats; delete s.chart;
    }
    s.bad = false;
  });

  slides.forEach((s) => delete s.retitle);
  return { slides, closing, aiUsed };
};

/* ========================================================================== *
 * 9. IMAGES  (Hugging Face text-to-image, time-boxed, parallel)
 * ========================================================================== */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const imageDims = (buf) => {
  try {
    if (buf[0] === 0x89 && buf[1] === 0x50) return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
    if (buf[0] === 0xff && buf[1] === 0xd8) {
      let p = 2;
      while (p < buf.length) {
        if (buf[p] !== 0xff) { p += 1; continue; }
        const m = buf[p + 1];
        if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) return { h: buf.readUInt16BE(p + 5), w: buf.readUInt16BE(p + 7) };
        p += 2 + buf.readUInt16BE(p + 2);
      }
    }
  } catch (_e) { /* fall through */ }
  return { w: 1024, h: 1024 };
};

const IMAGE_MODELS = () => {
  const cfg = process.env.HF_IMAGE_MODEL;
  const list = [cfg && cfg !== "black-forest-labs/FLUX.1-schnell" ? cfg : null, "stabilityai/stable-diffusion-3-medium-diffusers", "stabilityai/stable-diffusion-xl-base-1.0"];
  return [...new Set(list.filter(Boolean))];
};

// Tries each image model in turn. Token problems (401/403) stop immediately with a clear message.
const hfImage = async (prompt) => {
  let lastErr = "unknown error";
  for (const model of IMAGE_MODELS()) {
    const res = await axios.post(
      `https://router.huggingface.co/hf-inference/models/${model}`,
      { inputs: prompt, parameters: { num_inference_steps: Number(process.env.HF_IMAGE_STEPS) || 28 }, options: { wait_for_model: true } },
      { timeout: 70000, responseType: "arraybuffer", validateStatus: () => true,
        headers: { Authorization: `Bearer ${process.env.HF_TOKEN}`, Accept: "image/png", "Content-Type": "application/json" } }
    );
    const type = String(res.headers?.["content-type"] || "").toLowerCase();
    const buf = Buffer.from(res.data || []);
    if (res.status >= 200 && res.status < 300 && type.startsWith("image/") && buf.length) return { buf, mime: type.split(";")[0] };
    lastErr = `${model} -> HTTP ${res.status}: ${buf.toString("utf8").slice(0, 200)}`;
    if (res.status === 401 || res.status === 403) {
      const e = new Error(`Hugging Face rejected the token (HTTP ${res.status}). Create a token with the "Make calls to Inference Providers" permission. ${lastErr}`);
      e.fatal = true;
      throw e;
    }
  }
  throw new Error(lastErr);
};

const toImage = ({ buf, mime }) => ({ data: `data:${mime};base64,${buf.toString("base64")}`, ...imageDims(buf) });

const wikiImage = async (url) => {
  const res = await axios.get(url, { timeout: 9000, responseType: "arraybuffer", maxContentLength: 6e6, headers: { "User-Agent": "DRAG.ai/1.0 (presentation generator)" } });
  const mime = String(res.headers["content-type"] || "").split(";")[0];
  if (!/^image\/(png|jpe?g)$/.test(mime)) throw new Error("unsupported wiki image type");
  return toImage({ buf: Buffer.from(res.data), mime });
};

const imageStyleFor = (o, th) =>
  o.imageStyle || `modern editorial illustration, cohesive ${th.name} colour palette, soft light, clean composition, high detail, no text, no letters, no logos`;

// Which slides get a picture: cover > visual slides > split bullet slides (evenly spread), capped.
const planImageJobs = (deck, o, th) => {
  const cap = clamp(o.maxImages, 0, 12);
  if (!o.includeImages || cap === 0) return [];
  const style = imageStyleFor(o, th);
  const mk = (key, subject) => ({ key, prompt: `${subject}, ${style}` });
  const jobs = [mk("cover", `${deck.topic}, hero illustration representing ${deck.title}`)];

  const mids = deck.slides;
  const visuals = mids.filter((s) => s.type === "visual");
  const bullets = mids.filter((s) => s.type === "bullets");
  const room = Math.max(0, cap - 1 - visuals.length);
  const step = bullets.length && room ? bullets.length / room : 1;
  const picked = room ? Array.from({ length: Math.min(room, bullets.length) }, (_, k) => bullets[Math.floor(k * step)]) : [];

  [...visuals.slice(0, cap - 1), ...picked].forEach((s) => {
    jobs.push(mk(`s${s.slot}`, s.imagePrompt || `${s.title}, ${deck.topic}`));
  });
  return jobs.slice(0, cap);
};

const generateImages = async (deck, o, th, research) => {
  const images = new Map();
  const jobs = planImageJobs(deck, o, th);
  const deadline = Date.now() + (Number(process.env.PPT_IMAGE_BUDGET_MS) || 110000);

  if (process.env.HF_TOKEN && jobs.length) {
    let cursor = 0;
    const worker = async () => {
      while (cursor < jobs.length) {
        const job = jobs[cursor++];
        for (let attempt = 1; attempt <= 2 && Date.now() < deadline; attempt += 1) {
          try { images.set(job.key, toImage(await hfImage(job.prompt))); break; }
          catch (err) {
            console.error(`[ppt] image "${job.key}" attempt ${attempt}: ${err.message}`);
            images.lastError = err.message;
            if (err.fatal) { cursor = jobs.length; break; }
            await sleep(2500);
          }
        }
      }
    };
    await Promise.all([worker(), worker()]);
  }

  if (o.includeImages && !images.has("cover") && research?.imageUrl && process.env.PPT_WIKI_IMAGE_FALLBACK !== "false") {
    try { images.set("cover", await wikiImage(research.imageUrl)); images.wikiCover = true; }
    catch (err) { console.error("[ppt] wiki image fallback failed:", err.message); }
  }
  return images;
};

/* ========================================================================== *
 * 10. RENDERING
 * ========================================================================== */
const rect = (ctx, o) => ctx.slide.addShape(ctx.pptx.ShapeType[o.shape || "rect"], { line: { type: "none" }, ...o });

const text = (ctx, t, o) => ctx.slide.addText(Array.isArray(t) ? t : String(t), { margin: 0, fontFace: ctx.th.body, color: ctx.th.ink, ...o });

const placePicture = (ctx, img, x, y, w, h, extra = {}) => {
  // pptxgenjs "cover": element size = image's own size (any scale), sizing box = visible area
  const nat = { w: img.w / 100, h: img.h / 100 };
  ctx.slide.addImage({ data: img.data, x, y, ...nat, sizing: { type: "cover", w, h }, altText: ctx.alt || "Slide illustration", ...extra });
};

const chrome = (ctx, { x = 0.7, w = 11.9, title, narrow = false }) => {
  const { th, s, no, total } = ctx;
  ctx.slide.background = { color: th.bg };
  rect(ctx, { x, y: 0.5, w: 0.55, h: 0.07, fill: { color: th.primary } });
  text(ctx, `${String(no).padStart(2, "0")}   ·   ${(s.section || "").toUpperCase()}`, { x: x + 0.7, y: 0.4, w: w - 0.7, h: 0.28, fontSize: 10.5, bold: true, color: th.primary, charSpacing: 3 });
  const size = fitFont([title], w, 0.95, narrow ? 28 : 32, 20, { cw: 0.0083 });
  text(ctx, title, { x, y: 0.82, w, h: 0.95, fontSize: size, bold: true, fontFace: th.head, valign: "top" });
  text(ctx, ctx.deckTitle, { x, y: 7.03, w: w - 1.2, h: 0.25, fontSize: 9, color: th.muted });
  text(ctx, `${no} / ${total}`, { x: x + w - 1.1, y: 7.03, w: 1.1, h: 0.25, fontSize: 9, color: th.muted, align: "right" });
};

const BODY_Y = 2.0;

const R = {};

R.cover = (ctx) => {
  const { th, deck, img } = ctx;
  ctx.slide.background = { color: th.dark };
  const hasImg = !!img;
  const tw = hasImg ? 6.1 : 8.6;
  if (hasImg) {
    placePicture(ctx, img, 7.4, 0, W - 7.4, H);
    rect(ctx, { x: 7.4, y: 0, w: 0.1, h: H, fill: { color: th.accent } });
    rect(ctx, { x: 7.5, y: 0, w: W - 7.5, h: H, fill: { color: th.dark, transparency: 82 } });
  } else {
    rect(ctx, { shape: "ellipse", x: 8.4, y: -1.2, w: 6.6, h: 6.6, fill: { color: th.primary, transparency: 55 } });
    rect(ctx, { shape: "ellipse", x: 9.9, y: 3.4, w: 4.8, h: 4.8, fill: { color: th.secondary, transparency: 65 } });
    rect(ctx, { shape: "ellipse", x: 8.0, y: 4.9, w: 1.5, h: 1.5, fill: { color: th.accent, transparency: 15 } });
  }
  text(ctx, "DRAG.ai", { x: 0.8, y: 0.6, w: 3, h: 0.35, fontSize: 16, bold: true, color: th.accent, charSpacing: 2 });
  rect(ctx, { x: 0.8, y: 2.0, w: 0.9, h: 0.08, fill: { color: th.accent } });
  const size = fitFont([deck.title], tw, 2.3, 48, 26, { cw: 0.0086 });
  text(ctx, deck.title, { x: 0.8, y: 2.25, w: tw, h: 2.3, fontSize: size, bold: true, color: th.white, fontFace: th.head, valign: "top" });
  if (deck.subtitle) text(ctx, deck.subtitle, { x: 0.8, y: 4.65, w: tw, h: 0.9, fontSize: 18, color: th.darkMuted, valign: "top" });
  rect(ctx, { shape: "roundRect", rectRadius: 0.2, x: 0.8, y: 6.05, w: 3.9, h: 0.42, fill: { color: th.white, transparency: 90 }, line: { color: th.darkMuted, width: 0.75 } });
  text(ctx, `Prepared for ${cut(deck.audience, 34)}`, { x: 0.8, y: 6.05, w: 3.9, h: 0.42, fontSize: 12, color: th.white, align: "center", valign: "middle" });
};

R.agenda = (ctx) => {
  const { th, s } = ctx;
  ctx.slide.background = { color: th.bg };
  rect(ctx, { x: 0, y: 0, w: 4.9, h: H, fill: { color: th.dark } });
  rect(ctx, { x: 4.9, y: 0, w: 0.08, h: H, fill: { color: th.accent } });
  text(ctx, "AGENDA", { x: 0.7, y: 0.9, w: 3.7, h: 0.3, fontSize: 11, bold: true, color: th.accent, charSpacing: 4 });
  text(ctx, "What we will cover", { x: 0.7, y: 1.35, w: 3.8, h: 1.8, fontSize: 36, bold: true, color: th.white, fontFace: th.head, valign: "top" });
  text(ctx, ctx.deck.topic, { x: 0.7, y: 6.3, w: 3.8, h: 0.6, fontSize: 12, color: th.darkMuted, valign: "bottom" });
  const items = s.content.slice(0, 7);
  const rowH = Math.min(0.8, 5.4 / items.length);
  items.forEach((t, i) => {
    const y = 0.95 + i * (rowH + 0.1);
    text(ctx, String(i + 1).padStart(2, "0"), { x: 5.7, y, w: 0.9, h: rowH, fontSize: 26, bold: true, color: th.primary, fontFace: th.head, valign: "middle" });
    text(ctx, t, { x: 6.7, y, w: 6.0, h: rowH, fontSize: fitFont([t], 6, rowH, 22, 14), valign: "middle" });
    rect(ctx, { x: 5.7, y: y + rowH + 0.04, w: 7.0, h: 0.012, fill: { color: th.line } });
  });
};

R.bullets = (ctx) => {
  const { th, s, img, i } = ctx;
  const imgRight = i % 2 === 0;
  const x = img ? (imgRight ? 0.7 : 5.75) : 0.7;
  const w = img ? 6.9 : 11.9;
  if (img) {
    const px = imgRight ? 8.5 : 0;
    placePicture(ctx, img, px, 0, 4.833, H);
    rect(ctx, { x: imgRight ? 8.42 : 4.833, y: 0, w: 0.08, h: H, fill: { color: th.accent } });
  }
  chrome(ctx, { x, w, title: s.title, narrow: !!img });
  const pts = s.content.slice(0, 5);
  const gap = 0.14;
  const rowH = Math.min(1.0, (4.75 - gap * (pts.length - 1)) / pts.length);
  const size = fitFont(pts, w - 1.1, rowH - 0.1, 19, 12);
  pts.forEach((p, k) => {
    const y = BODY_Y + k * (rowH + gap);
    rect(ctx, { shape: "roundRect", rectRadius: 0.08, x, y, w, h: rowH, fill: { color: th.white }, line: { color: th.line, width: 0.75 } });
    rect(ctx, { shape: "roundRect", rectRadius: 0.06, x: x + 0.18, y: y + rowH / 2 - 0.22, w: 0.44, h: 0.44, fill: { color: k % 2 ? th.secondary : th.primary } });
    text(ctx, String(k + 1), { x: x + 0.18, y: y + rowH / 2 - 0.22, w: 0.44, h: 0.44, fontSize: 14, bold: true, color: th.white, align: "center", valign: "middle" });
    text(ctx, p, { x: x + 0.85, y, w: w - 1.05, h: rowH, fontSize: size, valign: "middle" });
  });
};

R.cards = (ctx) => {
  const { th, s } = ctx;
  chrome(ctx, { title: s.title });
  const n = s.cards.length;
  const gap = 0.3;
  const cw = (11.9 - gap * (n - 1)) / n;
  const body = s.cards.map((c) => c.text);
  const size = fitFont(body, cw - 0.6, 2.2, 16, 12);
  s.cards.forEach((c, k) => {
    const x = 0.7 + k * (cw + gap);
    const col = th.chart[k % th.chart.length];
    rect(ctx, { shape: "roundRect", rectRadius: 0.1, x, y: BODY_Y, w: cw, h: 4.0, fill: { color: th.white }, line: { color: th.line, width: 0.75 } });
    rect(ctx, { x: x + 0.3, y: BODY_Y + 0.3, w: 0.6, h: 0.07, fill: { color: col } });
    text(ctx, String(k + 1).padStart(2, "0"), { x: x + 0.3, y: BODY_Y + 0.5, w: cw - 0.6, h: 0.8, fontSize: 38, bold: true, fontFace: th.head, color: mix(col, "FFFFFF", 0.55) });
    text(ctx, c.heading, { x: x + 0.3, y: BODY_Y + 1.4, w: cw - 0.6, h: 0.8, fontSize: fitFont([c.heading], cw - 0.6, 0.8, 21, 15, { cw: 0.0083 }), bold: true, fontFace: th.head, valign: "top" });
    text(ctx, c.text, { x: x + 0.3, y: BODY_Y + 2.25, w: cw - 0.6, h: 1.6, fontSize: size, color: th.muted, valign: "top" });
  });
};

R.stats = (ctx) => {
  const { th, s } = ctx;
  chrome(ctx, { title: s.title });
  const items = s.stats;
  const n = items.length;
  const gap = 0.3;
  const cw = (11.9 - gap * (n - 1)) / n;
  items.forEach((st, k) => {
    const x = 0.7 + k * (cw + gap);
    const col = th.chart[k % th.chart.length];
    rect(ctx, { shape: "roundRect", rectRadius: 0.1, x, y: BODY_Y, w: cw, h: 3.55, fill: { color: th.white }, line: { color: th.line, width: 0.75 } });
    rect(ctx, { x, y: BODY_Y, w: cw, h: 0.1, fill: { color: col } });
    text(ctx, st.value, { x: x + 0.2, y: BODY_Y + 0.45, w: cw - 0.4, h: 1.3, fontSize: fitFont([st.value], cw - 0.4, 1.3, n === 1 ? 88 : 60, 30, { cw: 0.0105 }), bold: true, fontFace: th.head, color: col, align: "center", valign: "middle" });
    text(ctx, st.label, { x: x + 0.3, y: BODY_Y + 1.9, w: cw - 0.6, h: 0.7, fontSize: fitFont([st.label], cw - 0.6, 0.7, 17, 12), bold: true, align: "center", valign: "top" });
    if (st.note) text(ctx, st.note, { x: x + 0.3, y: BODY_Y + 2.6, w: cw - 0.6, h: 0.8, fontSize: 12, color: th.muted, align: "center", valign: "top" });
  });
  const line = s.content[0];
  if (line) {
    rect(ctx, { shape: "roundRect", rectRadius: 0.08, x: 0.7, y: 5.8, w: 11.9, h: 0.85, fill: { color: th.soft } });
    rect(ctx, { x: 0.7, y: 5.8, w: 0.09, h: 0.85, fill: { color: th.primary } });
    text(ctx, line, { x: 1.05, y: 5.8, w: 11.3, h: 0.85, fontSize: fitFont([line], 11.3, 0.8, 17, 12), italic: true, valign: "middle" });
  }
};

R.chart = (ctx) => {
  const { th, s, pptx } = ctx;
  chrome(ctx, { title: s.title });
  const { chartType, categories, series, note } = s.chart;
  const pie = chartType === "pie" || chartType === "doughnut";
  rect(ctx, { shape: "roundRect", rectRadius: 0.1, x: 0.7, y: BODY_Y, w: 7.7, h: 4.75, fill: { color: th.white }, line: { color: th.line, width: 0.75 } });
  const map = { bar: pptx.ChartType.bar, line: pptx.ChartType.line, pie: pptx.ChartType.pie, doughnut: pptx.ChartType.doughnut };
  const data = series.map((x) => ({ name: x.name, labels: categories, values: x.values }));
  ctx.slide.addChart(map[chartType], data, {
    x: 0.9, y: BODY_Y + 0.15, w: 7.3, h: 4.15, chartColors: pie ? th.chart.slice(0, categories.length) : th.chart.slice(0, series.length),
    showLegend: series.length > 1 || pie, legendPos: pie ? "r" : "b", legendFontSize: 11, legendColor: th.muted, showTitle: false,
    showValue: !pie || false, showPercent: pie, dataLabelColor: th.ink, dataLabelFontSize: 10, dataLabelFontBold: true,
    catAxisLabelColor: th.muted, catAxisLabelFontSize: 11, valAxisLabelColor: th.muted, valAxisLabelFontSize: 10,
    catAxisLineShow: false, valAxisLineShow: false, valGridLine: { color: th.line, size: 0.5 }, catGridLine: { style: "none" },
    barGapWidthPct: 55, lineSize: 3, lineDataSymbolSize: 9,
  });
  text(ctx, note, { x: 0.95, y: BODY_Y + 4.3, w: 7.2, h: 0.3, fontSize: 10, italic: true, color: th.muted });
  const pts = s.content.slice(0, 3);
  const gap = 0.18;
  const h = (4.75 - gap * (pts.length - 1)) / Math.max(1, pts.length);
  const size = fitFont(pts, 3.45, h - 0.2, 15, 11);
  pts.forEach((p, k) => {
    const y = BODY_Y + k * (h + gap);
    rect(ctx, { shape: "roundRect", rectRadius: 0.08, x: 8.7, y, w: 3.9, h, fill: { color: th.white }, line: { color: th.line, width: 0.75 } });
    rect(ctx, { x: 8.7, y, w: 0.09, h, fill: { color: th.chart[k % th.chart.length] } });
    text(ctx, p, { x: 9.0, y, w: 3.45, h, fontSize: size, valign: "middle" });
  });
};

R.process = (ctx) => {
  const { th, s } = ctx;
  chrome(ctx, { title: s.title });
  const n = s.steps.length;
  const gap = 0.3;
  const cw = (11.9 - gap * (n - 1)) / n;
  const cy = BODY_Y + 0.45;
  rect(ctx, { x: 0.7 + cw / 2, y: cy - 0.01, w: 11.9 - cw, h: 0.03, fill: { color: th.line } });
  const size = fitFont(s.steps.map((x) => x.description), cw - 0.4, 2.0, 15, 11);
  s.steps.forEach((st, k) => {
    const x = 0.7 + k * (cw + gap);
    const col = th.chart[k % th.chart.length];
    rect(ctx, { shape: "ellipse", x: x + cw / 2 - 0.45, y: cy - 0.45, w: 0.9, h: 0.9, fill: { color: col }, line: { color: th.bg, width: 4 } });
    text(ctx, String(k + 1), { x: x + cw / 2 - 0.45, y: cy - 0.45, w: 0.9, h: 0.9, fontSize: 24, bold: true, color: th.white, align: "center", valign: "middle", fontFace: th.head });
    rect(ctx, { shape: "roundRect", rectRadius: 0.1, x, y: cy + 0.8, w: cw, h: 2.75, fill: { color: th.white }, line: { color: th.line, width: 0.75 } });
    text(ctx, st.label, { x: x + 0.2, y: cy + 1.0, w: cw - 0.4, h: 0.75, fontSize: fitFont([st.label], cw - 0.4, 0.75, 19, 14, { cw: 0.0083 }), bold: true, fontFace: th.head, align: "center", valign: "top" });
    text(ctx, st.description, { x: x + 0.2, y: cy + 1.8, w: cw - 0.4, h: 1.6, fontSize: size, color: th.muted, align: "center", valign: "top" });
  });
  if (s.content[0]) text(ctx, s.content[0], { x: 0.7, y: 6.55, w: 11.9, h: 0.35, fontSize: 12, italic: true, color: th.muted, align: "center" });
};

R.timeline = (ctx) => {
  const { th, s } = ctx;
  chrome(ctx, { title: s.title });
  const n = s.events.length;
  const cw = 11.9 / n;
  const ly = 3.55;
  rect(ctx, { x: 0.7, y: ly - 0.02, w: 11.9, h: 0.05, fill: { color: th.line } });
  rect(ctx, { x: 0.7, y: ly - 0.02, w: 11.9 * ((n - 0.5) / n), h: 0.05, fill: { color: th.primary } });
  const size = fitFont(s.events.map((e) => e.description), cw - 0.3, 2.3, 14, 11);
  s.events.forEach((e, k) => {
    const x = 0.7 + k * cw;
    const col = th.chart[k % th.chart.length];
    text(ctx, e.label, { x: x + 0.1, y: ly - 1.25, w: cw - 0.2, h: 0.85, fontSize: fitFont([e.label], cw - 0.2, 0.85, 24, 14, { cw: 0.0095 }), bold: true, fontFace: th.head, color: col, align: "center", valign: "bottom" });
    rect(ctx, { shape: "ellipse", x: x + cw / 2 - 0.2, y: ly - 0.2, w: 0.4, h: 0.4, fill: { color: col }, line: { color: th.bg, width: 3 } });
    rect(ctx, { x: x + cw / 2 - 0.01, y: ly + 0.2, w: 0.02, h: 0.35, fill: { color: th.line } });
    text(ctx, e.description, { x: x + 0.15, y: ly + 0.65, w: cw - 0.3, h: 2.4, fontSize: size, color: th.muted, align: "center", valign: "top" });
  });
  if (s.content[0]) text(ctx, s.content[0], { x: 0.7, y: 6.55, w: 11.9, h: 0.35, fontSize: 12, italic: true, color: th.muted, align: "center" });
};

R.comparison = (ctx) => {
  const { th, s } = ctx;
  chrome(ctx, { title: s.title });
  const colW = 5.75;
  const hasVerdict = !!s.content[0];
  const colH = hasVerdict ? 3.75 : 4.6;
  const size = Math.min(...s.columns.map((c) => fitFont(c.points, colW - 0.9, colH - 1.3, 20, 12, { gap: 8 })));
  s.columns.forEach((c, k) => {
    const x = k === 0 ? 0.7 : 0.7 + 11.9 - colW;
    const col = k === 0 ? th.primary : th.secondary;
    rect(ctx, { shape: "roundRect", rectRadius: 0.1, x, y: BODY_Y, w: colW, h: colH, fill: { color: th.white }, line: { color: th.line, width: 0.75 } });
    rect(ctx, { shape: "roundRect", rectRadius: 0.1, x, y: BODY_Y, w: colW, h: 0.7, fill: { color: col } });
    text(ctx, c.heading, { x: x + 0.3, y: BODY_Y, w: colW - 0.6, h: 0.7, fontSize: 19, bold: true, color: th.white, fontFace: th.head, valign: "middle" });
    const bullets = c.points.map((p) => ({ text: p, options: { bullet: { indent: 16 }, breakLine: true, paraSpaceAfter: 8 } }));
    text(ctx, bullets, { x: x + 0.35, y: BODY_Y + 0.95, w: colW - 0.7, h: colH - 1.15, fontSize: size, valign: "top" });
  });
  rect(ctx, { shape: "ellipse", x: W / 2 - 0.35, y: BODY_Y + colH / 2 - 0.35, w: 0.7, h: 0.7, fill: { color: th.bg }, line: { color: th.line, width: 1.5 } });
  text(ctx, "VS", { x: W / 2 - 0.35, y: BODY_Y + colH / 2 - 0.35, w: 0.7, h: 0.7, fontSize: 14, bold: true, color: th.muted, align: "center", valign: "middle" });
  if (hasVerdict) {
    rect(ctx, { shape: "roundRect", rectRadius: 0.08, x: 0.7, y: 5.95, w: 11.9, h: 0.75, fill: { color: th.soft } });
    text(ctx, s.content[0], { x: 1.0, y: 5.95, w: 11.3, h: 0.75, fontSize: fitFont([s.content[0]], 11.3, 0.7, 17, 12), italic: true, valign: "middle", align: "center" });
  }
};

R.spotlight = (ctx) => {
  const { th, s } = ctx;
  ctx.slide.background = { color: th.bg };
  rect(ctx, { x: 0, y: 0, w: 7.7, h: H, fill: { color: th.dark } });
  rect(ctx, { shape: "ellipse", x: -1.5, y: 4.8, w: 4.5, h: 4.5, fill: { color: th.primary, transparency: 70 } });
  text(ctx, "“", { x: 0.7, y: 0.9, w: 2, h: 1.4, fontSize: 120, bold: true, color: th.accent, fontFace: "Georgia" });
  text(ctx, s.statement, { x: 0.8, y: 2.3, w: 6.1, h: 3.4, fontSize: fitFont([s.statement], 6.1, 3.4, 36, 20, { cw: 0.0088 }), bold: true, color: th.white, fontFace: th.head, valign: "top" });
  text(ctx, `${String(ctx.no).padStart(2, "0")}   ·   ${(s.section || "").toUpperCase()}`, { x: 0.8, y: 6.7, w: 6, h: 0.3, fontSize: 10, bold: true, color: th.accent, charSpacing: 3 });
  const x = 8.2;
  const w = 4.45;
  text(ctx, s.title, { x, y: 0.8, w, h: 1.3, fontSize: fitFont([s.title], w, 1.3, 26, 18, { cw: 0.0085 }), bold: true, fontFace: th.head, valign: "top" });
  rect(ctx, { x, y: 2.2, w: 0.55, h: 0.07, fill: { color: th.primary } });
  const pts = s.content.slice(0, 3);
  const gap = 0.2;
  const h = Math.min(1.35, (4.2 - gap * (pts.length - 1)) / Math.max(1, pts.length));
  const size = fitFont(pts, w - 0.6, h - 0.15, 15, 11);
  pts.forEach((p, k) => {
    const y = 2.6 + k * (h + gap);
    rect(ctx, { shape: "roundRect", rectRadius: 0.08, x, y, w, h, fill: { color: th.white }, line: { color: th.line, width: 0.75 } });
    rect(ctx, { x, y, w: 0.09, h, fill: { color: th.chart[k % th.chart.length] } });
    text(ctx, p, { x: x + 0.3, y, w: w - 0.5, h, fontSize: size, valign: "middle" });
  });
  text(ctx, `${ctx.no} / ${ctx.total}`, { x: 11.5, y: 7.03, w: 1.15, h: 0.25, fontSize: 9, color: th.muted, align: "right" });
};

R.visual = (ctx) => {
  const { th, s, img } = ctx;
  if (!img) return R.spotlight({ ...ctx, s: { ...s, statement: s.caption } });
  ctx.slide.background = { color: th.dark };
  placePicture(ctx, img, 0, 0, W, H);
  rect(ctx, { x: 0, y: 0, w: W, h: H, fill: { color: th.dark, transparency: 55 } });
  rect(ctx, { x: 0, y: 3.6, w: W, h: 3.9, fill: { color: th.dark, transparency: 25 } });
  text(ctx, `${String(ctx.no).padStart(2, "0")}   ·   ${(s.section || "").toUpperCase()}`, { x: 0.8, y: 3.9, w: 8, h: 0.3, fontSize: 10.5, bold: true, color: th.accent, charSpacing: 3 });
  text(ctx, s.title, { x: 0.8, y: 4.25, w: 11.7, h: 1.2, fontSize: fitFont([s.title], 11.7, 1.2, 44, 26, { cw: 0.0086 }), bold: true, color: th.white, fontFace: th.head, valign: "top" });
  text(ctx, s.caption, { x: 0.8, y: 5.5, w: 9.5, h: 0.9, fontSize: fitFont([s.caption], 9.5, 0.9, 20, 14), color: "E5E7EB", valign: "top" });
  const chips = s.content.slice(0, 2);
  chips.forEach((c, k) => {
    rect(ctx, { shape: "roundRect", rectRadius: 0.2, x: 0.8 + k * 5.0, y: 6.45, w: 4.8, h: 0.42, fill: { color: th.white, transparency: 88 }, line: { color: th.darkMuted, width: 0.75 } });
    text(ctx, c, { x: 0.95 + k * 5.0, y: 6.45, w: 4.5, h: 0.42, fontSize: 11, color: th.white, valign: "middle" });
  });
  text(ctx, `${ctx.no} / ${ctx.total}`, { x: 11.5, y: 7.03, w: 1.15, h: 0.25, fontSize: 9, color: th.darkMuted, align: "right" });
};

R.closing = (ctx) => {
  const { th, s, img } = ctx;
  ctx.slide.background = { color: th.dark };
  if (img) {
    placePicture(ctx, img, 8.4, 0, W - 8.4, H);
    rect(ctx, { x: 8.4, y: 0, w: W - 8.4, h: H, fill: { color: th.dark, transparency: 35 } });
  } else {
    rect(ctx, { shape: "ellipse", x: 9.2, y: -1, w: 6, h: 6, fill: { color: th.primary, transparency: 55 } });
    rect(ctx, { shape: "ellipse", x: 10.2, y: 4.2, w: 4, h: 4, fill: { color: th.secondary, transparency: 65 } });
  }
  rect(ctx, { x: 0.8, y: 0.85, w: 0.55, h: 0.07, fill: { color: th.accent } });
  text(ctx, "KEY TAKEAWAYS", { x: 1.5, y: 0.72, w: 5, h: 0.3, fontSize: 11, bold: true, color: th.accent, charSpacing: 4 });
  text(ctx, s.title, { x: 0.8, y: 1.15, w: 7.2, h: 0.9, fontSize: 34, bold: true, color: th.white, fontFace: th.head, valign: "top" });
  const pts = s.content.slice(0, 4);
  const rowH = Math.min(1.0, 3.5 / Math.max(1, pts.length));
  const size = fitFont(pts, 6.2, rowH - 0.1, 19, 13);
  pts.forEach((p, k) => {
    const y = 2.4 + k * (rowH + 0.12);
    rect(ctx, { shape: "ellipse", x: 0.8, y: y + rowH / 2 - 0.25, w: 0.5, h: 0.5, fill: { color: th.chart[k % th.chart.length] } });
    text(ctx, String(k + 1), { x: 0.8, y: y + rowH / 2 - 0.25, w: 0.5, h: 0.5, fontSize: 15, bold: true, color: th.white, align: "center", valign: "middle" });
    text(ctx, p, { x: 1.6, y, w: 6.4, h: rowH, fontSize: size, color: th.white, valign: "middle" });
  });
  text(ctx, "Thank you", { x: 8.9, y: 2.6, w: 4.0, h: 1.0, fontSize: 40, bold: true, color: th.white, fontFace: th.head });
  if (s.cta) text(ctx, s.cta, { x: 8.9, y: 3.7, w: 3.9, h: 0.9, fontSize: 16, color: "E5E7EB", valign: "top" });
  text(ctx, "Questions?", { x: 8.9, y: 4.8, w: 3.9, h: 0.5, fontSize: 18, bold: true, color: th.accent });
};

/* ========================================================================== *
 * 11. ASSEMBLY
 * ========================================================================== */
const renderDeck = async (deck, images, th, o) => {
  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "DRAG.ai";
  pptx.company = "DRAG.ai";
  pptx.title = deck.title;
  pptx.subject = deck.topic;
  pptx.theme = { headFontFace: th.head, bodyFontFace: th.body, lang: "en-US" };

  const total = deck.all.length;
  deck.all.forEach((s, i) => {
    const slide = pptx.addSlide();
    const key = s.type === "cover" ? "cover" : s.type === "closing" ? "cover" : `s${s.slot}`;
    const ctx = { pptx, slide, th, s, deck, deckTitle: cut(deck.title, 70), i, no: i + 1, total, img: images.get(key) || null, alt: s.title };
    try {
      (R[s.type] || R.bullets)(ctx);
    } catch (err) {
      console.error(`[ppt] render "${s.type}" slide ${i + 1} failed -> bullets fallback: ${err.message}`);
      const safe = pptx.addSlide();
      R.bullets({ ...ctx, slide: safe, s: { ...s, type: "bullets", content: s.content?.length ? s.content : [s.title] }, img: null });
    }
    if (o.includeNotes && s.notes) slide.addNotes(s.notes);
  });

  const fileName = `DRAG_AI_${Date.now()}.pptx`;
  await pptx.writeFile({ fileName, compression: true });
  return fileName;
};

const normalizeOptions = (data) => {
  const opt = { ...data, ...(data.options && typeof data.options === "object" ? data.options : {}) };
  const topic = str(opt.topic) || "Untitled topic";
  const bool = (v, d) => (v === undefined || v === null || v === "" ? d : !(v === false || v === "false" || v === 0));
  return {
    topic,
    title: str(opt.title) || topic,
    audience: str(opt.audience || opt.targetAudience) || "a general audience",
    count: clamp(Math.round(Number(opt.slideCount) || 6), MIN_SLIDES, MAX_SLIDES),
    tone: str(opt.tone) || "clear, confident and engaging",
    language: str(opt.language) || "English",
    theme: opt.theme,
    includeImages: bool(opt.includeImages, true),
    maxImages: Number.isFinite(Number(opt.maxImages)) && opt.maxImages !== undefined && opt.maxImages !== "" ? Number(opt.maxImages) : Number(process.env.PPT_MAX_IMAGES) || 8,
    includeNotes: bool(opt.includeNotes, true),
    includeAgenda: opt.includeAgenda === undefined ? undefined : bool(opt.includeAgenda, true),
    imageStyle: str(opt.imageStyle),
    extraNotes: cut(opt.extraNotes, 600),
  };
};

const generatePresentation = async (data = {}) => {
  const o = normalizeOptions(data);
  const warnings = [];

  const research = await fetchResearch(o.topic);
  o.research = research;

  // Slide budget: cover + (agenda for >= 8) + content + closing  === total requested
  const agenda = o.includeAgenda === undefined ? o.count >= 8 : o.includeAgenda && o.count >= 5;
  const midCount = o.count - 2 - (agenda ? 1 : 0);

  const planned = await planDeck(o, midCount);
  const { slides, closing, aiUsed } = await writeSlides(o, planned.plan, research);
  if (!aiUsed) warnings.push("No AI provider responded (set HF_TOKEN or GEMINI_API_KEY); used the offline writer.");

  const themeName = pickTheme(o.topic, o.theme || planned.theme);
  const th = buildTheme(themeName);
  const title = (o.title && o.title !== o.topic ? o.title : planned.title) || o.title;

  const cover = { type: "cover", slot: -1, title, content: [planned.subtitle].filter(Boolean), notes: `Welcome the audience and introduce ${o.topic}.` };
  const sections = [...new Set(slides.map((s) => s.section))].slice(0, 7);
  const agendaItems = sections.length >= 3 ? sections : slides.filter((_, i) => i % Math.ceil(slides.length / 6) === 0).map((s) => s.title).slice(0, 6);
  const agendaSlide = { type: "agenda", slot: -2, title: "Agenda", section: "Agenda", content: agendaItems, notes: "Give a one-line preview of each part." };

  const closingSlide = sanitizeSlide(
    { ...(closing || {}), title: "Key takeaways", content: closing?.content, notes: closing?.notes || "Recap the main ideas and invite questions.", cta: closing?.cta },
    { index: 999, section: "Wrap-up", title: "Key takeaways", angle: "recap", type: "bullets" }
  );
  closingSlide.type = "closing";
  closingSlide.slot = -3;
  closingSlide.cta = cut(closing?.cta, 80) || "Thanks for listening";
  if (closingSlide.content.length < 2) closingSlide.content = slides.slice(0, 4).map((s) => cut(s.title, 60));

  const deck = {
    title, subtitle: planned.subtitle, topic: o.topic, audience: o.audience, slides,
    all: [cover, ...(agenda ? [agendaSlide] : []), ...slides, closingSlide],
  };

  const images = await generateImages(deck, o, th, research);
  if (o.includeImages && !process.env.HF_TOKEN) warnings.push("HF_TOKEN is not set in backend/.env, so no Hugging Face images were generated.");
  else if (o.includeImages && !images.size) warnings.push(`Image generation failed: ${images.lastError || "no response"}`);
  console.log(`[ppt] ${deck.all.length} slides, ${images.size} images, source=${planned.source}${warnings.length ? ", warnings: " + warnings.join(" | ") : ""}`);
  if (images.wikiCover) cover.notes += " Cover image: Wikipedia.";
  // slides that did not get a picture should not claim to need one
  const fileName = await renderDeck(deck, images, th, o);

  // lightweight, DB-friendly slide list (no image bytes)
  const outSlides = deck.all.map((s) => {
    const { angle, bad, fromFallback, retitle, slot, ...rest } = s;
    return { ...rest, hasImage: images.has(s.type === "cover" || s.type === "closing" ? "cover" : `s${slot}`) };
  });

  return {
    title,
    slides: outSlides,
    fileName,
    source: planned.source,
    theme: themeName,
    imagesGenerated: images.size,
    research: research ? { title: research.title, url: research.url } : null,
    warnings,
  };
};

module.exports = { generatePresentation };