const pptxgen = require("pptxgenjs");
const { generateSlideImage } = require("./imageGenService");

const COLORS = {
  navy: "172554",
  blue: "2563EB",
  lightBlue: "EFF6FF",
  white: "FFFFFF",
  dark: "111827",
  gray: "64748B",
  lightGray: "F8FAFC",
  border: "E2E8F0",
  accent: "38BDF8",
  green: "16A34A",
  amber: "F59E0B",
  violet: "7C3AED",
};

const CHART_COLOR_SET = [COLORS.blue, COLORS.accent, COLORS.violet, COLORS.amber, COLORS.green];

const CHART_TYPE_MAP = (pptx) => ({
  bar: pptx.ChartType.bar,
  line: pptx.ChartType.line,
  pie: pptx.ChartType.pie,
  doughnut: pptx.ChartType.doughnut,
});

// --------------------------------------------------
// Shared slide chrome (accent bar, number badge, title, divider, footer)
// --------------------------------------------------
const addSlideChrome = (pptx, slide, index, title) => {
  slide.background = { color: COLORS.lightGray };

  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 13.33,
    h: 0.12,
    fill: { color: COLORS.blue },
    line: { color: COLORS.blue },
  });

  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.65,
    y: 0.55,
    w: 0.65,
    h: 0.65,
    rectRadius: 0.08,
    fill: { color: COLORS.blue },
    line: { color: COLORS.blue },
  });

  slide.addText(String(index + 1), {
    x: 0.65,
    y: 0.69,
    w: 0.65,
    h: 0.25,
    fontSize: 13,
    bold: true,
    color: COLORS.white,
    align: "center",
    margin: 0,
  });

  slide.addText(String(title || `Slide ${index + 1}`), {
    x: 1.5,
    y: 0.55,
    w: 10.9,
    h: 0.65,
    fontSize: 27,
    bold: true,
    color: COLORS.dark,
    margin: 0,
  });

  slide.addShape(pptx.ShapeType.line, {
    x: 1.5,
    y: 1.3,
    w: 10.8,
    h: 0,
    line: { color: COLORS.border, width: 1.2 },
  });

  slide.addText("DRAG.ai • AI-Powered Presentation Generator", {
    x: 0.7,
    y: 6.75,
    w: 7,
    h: 0.25,
    fontSize: 9,
    color: COLORS.gray,
    margin: 0,
  });

  slide.addText(`${index + 1}`, {
    x: 12,
    y: 6.72,
    w: 0.55,
    h: 0.25,
    fontSize: 9,
    color: COLORS.gray,
    align: "right",
    margin: 0,
  });
};

const addContentCard = (pptx, slide, opts = {}) => {
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.7,
    y: 1.65,
    w: 11.95,
    h: 4.65,
    rectRadius: 0.08,
    fill: { color: COLORS.white },
    line: { color: COLORS.border, width: 1 },
    shadow: {
      type: "outer",
      color: "CBD5E1",
      blur: 1,
      angle: 45,
      distance: 1,
      opacity: 0.18,
    },
    ...opts,
  });
};

// --------------------------------------------------
// Per-type slide bodies
// --------------------------------------------------

const renderBulletsSlide = (pptx, slide, slideData) => {
  const image = slideData._image;

  if (image) {
    // Split layout: bullets on the left, generated illustration on the right.
    addContentCard(pptx, slide);

    const bullets = (slideData.content || []).map((point) => ({
      text: String(point),
      options: { bullet: { indent: 16 }, hanging: 4, breakLine: true },
    }));

    if (bullets.length > 0) {
      slide.addText(bullets, {
        x: 1.0,
        y: 2.05,
        w: 6.85,
        h: 3.8,
        fontSize: 17,
        color: "334155",
        valign: "mid",
        margin: 0.05,
        breakLine: false,
        paraSpaceAfterPt: 12,
      });
    }

    slide.addShape(pptx.ShapeType.roundRect, {
      x: 8.15,
      y: 1.95,
      w: 4.2,
      h: 4.05,
      rectRadius: 0.06,
      fill: { color: COLORS.lightBlue },
      line: { color: COLORS.border, width: 1 },
    });

    slide.addImage({
      data: `data:${image.mime};base64,${image.base64}`,
      x: 8.3,
      y: 2.1,
      w: 3.9,
      h: 3.75,
      sizing: { type: "cover", w: 3.9, h: 3.75 },
      rounding: true,
    });

    return;
  }

  addContentCard(pptx, slide);

  const bullets = (slideData.content || []).map((point) => ({
    text: String(point),
    options: {
      bullet: { indent: 18 },
      hanging: 4,
      breakLine: true,
    },
  }));

  if (bullets.length > 0) {
    slide.addText(bullets, {
      x: 1.15,
      y: 2.05,
      w: 10.9,
      h: 3.8,
      fontSize: 18,
      color: "334155",
      valign: "mid",
      margin: 0.05,
      breakLine: false,
      paraSpaceAfterPt: 14,
    });
  }
};

const renderChartSlide = (pptx, slide, slideData) => {
  addContentCard(pptx, slide, { h: 4.9 });

  const { chartType, categories, series } = slideData.chart;
  const chartTypeMap = CHART_TYPE_MAP(pptx);
  const resolvedType = chartTypeMap[chartType] || chartTypeMap.bar;

  const chartData = series.map((s, i) => ({
    name: s.name,
    labels: categories,
    values: s.values,
    color: CHART_COLOR_SET[i % CHART_COLOR_SET.length],
  }));

  const isPieLike = chartType === "pie" || chartType === "doughnut";

  slide.addChart(resolvedType, chartData, {
    x: 1.1,
    y: 1.95,
    w: 10.9,
    h: 4.15,
    chartColors: CHART_COLOR_SET,
    showLegend: series.length > 1 || isPieLike,
    legendPos: "b",
    showTitle: false,
    showValue: isPieLike,
    dataLabelColor: COLORS.dark,
    catAxisLabelColor: COLORS.gray,
    valAxisLabelColor: COLORS.gray,
    catAxisLineColor: COLORS.border,
    valAxisLineColor: COLORS.border,
    barGapWidthPct: 35,
  });

  if (slideData.content?.[0]) {
    slide.addText(String(slideData.content[0]), {
      x: 1.1,
      y: 6.05,
      w: 10.9,
      h: 0.4,
      fontSize: 11,
      italic: true,
      color: COLORS.gray,
      margin: 0,
    });
  }
};

const renderProcessSlide = (pptx, slide, slideData) => {
  addContentCard(pptx, slide);

  const steps = slideData.steps;
  const count = steps.length;
  const cardX = 1.0;
  const cardW = 11.35;
  const gap = 0.25;
  const boxW = (cardW - gap * (count - 1)) / count;
  const boxY = 2.15;
  const boxH = 2.9;

  steps.forEach((step, i) => {
    const x = cardX + i * (boxW + gap);

    slide.addShape(pptx.ShapeType.roundRect, {
      x,
      y: boxY,
      w: boxW,
      h: boxH,
      rectRadius: 0.06,
      fill: { color: COLORS.lightBlue },
      line: { color: COLORS.blue, width: 1 },
    });

    slide.addShape(pptx.ShapeType.ellipse, {
      x: x + boxW / 2 - 0.28,
      y: boxY - 0.28,
      w: 0.56,
      h: 0.56,
      fill: { color: COLORS.blue },
      line: { color: COLORS.white, width: 2 },
    });

    slide.addText(String(i + 1), {
      x: x + boxW / 2 - 0.28,
      y: boxY - 0.28,
      w: 0.56,
      h: 0.56,
      fontSize: 16,
      bold: true,
      color: COLORS.white,
      align: "center",
      valign: "mid",
      margin: 0,
    });

    slide.addText(String(step.label), {
      x: x + 0.12,
      y: boxY + 0.4,
      w: boxW - 0.24,
      h: 0.65,
      fontSize: 14,
      bold: true,
      color: COLORS.dark,
      align: "center",
      valign: "top",
      margin: 0,
    });

    if (step.description) {
      slide.addText(String(step.description), {
        x: x + 0.15,
        y: boxY + 1.05,
        w: boxW - 0.3,
        h: boxH - 1.2,
        fontSize: 11,
        color: COLORS.gray,
        align: "center",
        valign: "top",
        margin: 0,
      });
    }

    if (i < count - 1) {
      slide.addShape(pptx.ShapeType.chevron, {
        x: x + boxW - 0.02,
        y: boxY + boxH / 2 - 0.14,
        w: gap + 0.04,
        h: 0.28,
        fill: { color: COLORS.accent },
        line: { color: COLORS.accent },
      });
    }
  });

  if (slideData.content?.[0]) {
    slide.addText(String(slideData.content[0]), {
      x: 1.0,
      y: boxY + boxH + 0.3,
      w: cardW,
      h: 0.4,
      fontSize: 11,
      italic: true,
      color: COLORS.gray,
      align: "center",
      margin: 0,
    });
  }
};

const renderComparisonSlide = (pptx, slide, slideData) => {
  addContentCard(pptx, slide);

  const [left, right] = slideData.columns;
  const colY = 2.0;
  const colH = 4.15;
  const colW = 5.55;
  const leftX = 0.95;
  const rightX = 6.85;
  const columnColors = [COLORS.blue, COLORS.violet];

  [{ col: left, x: leftX, color: columnColors[0] }, { col: right, x: rightX, color: columnColors[1] }].forEach(
    ({ col, x, color }) => {
      slide.addShape(pptx.ShapeType.roundRect, {
        x,
        y: colY,
        w: colW,
        h: colH,
        rectRadius: 0.06,
        fill: { color: COLORS.lightGray },
        line: { color: COLORS.border, width: 1 },
      });

      slide.addShape(pptx.ShapeType.roundRect, {
        x,
        y: colY,
        w: colW,
        h: 0.55,
        rectRadius: 0.06,
        fill: { color },
        line: { color },
      });

      slide.addText(String(col.heading), {
        x: x + 0.15,
        y: colY,
        w: colW - 0.3,
        h: 0.55,
        fontSize: 15,
        bold: true,
        color: COLORS.white,
        valign: "mid",
        margin: 0,
      });

      const bullets = (col.points || []).map((point) => ({
        text: String(point),
        options: { bullet: { indent: 14 }, breakLine: true },
      }));

      if (bullets.length > 0) {
        slide.addText(bullets, {
          x: x + 0.3,
          y: colY + 0.75,
          w: colW - 0.6,
          h: colH - 1.0,
          fontSize: 14,
          color: "334155",
          valign: "top",
          paraSpaceAfterPt: 10,
        });
      }
    }
  );

  slide.addShape(pptx.ShapeType.ellipse, {
    x: 6.665 - 0.32,
    y: colY + colH / 2 - 0.32,
    w: 0.64,
    h: 0.64,
    fill: { color: COLORS.white },
    line: { color: COLORS.border, width: 1.5 },
  });

  slide.addText("VS", {
    x: 6.665 - 0.32,
    y: colY + colH / 2 - 0.32,
    w: 0.64,
    h: 0.64,
    fontSize: 13,
    bold: true,
    color: COLORS.gray,
    align: "center",
    valign: "mid",
    margin: 0,
  });
};

const renderStatsSlide = (pptx, slide, slideData) => {
  addContentCard(pptx, slide);

  const image = slideData._image;
  const hasImage = Boolean(image);

  const numberX = hasImage ? 0.95 : 0.95;
  const numberW = hasImage ? 7.6 : 11.45;

  if (hasImage) {
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 9.05,
      y: 2.3,
      w: 3.0,
      h: 3.0,
      rectRadius: 0.06,
      fill: { color: COLORS.lightBlue },
      line: { color: COLORS.border, width: 1 },
    });

    slide.addImage({
      data: `data:${image.mime};base64,${image.base64}`,
      x: 9.15,
      y: 2.4,
      w: 2.8,
      h: 2.8,
      sizing: { type: "cover", w: 2.8, h: 2.8 },
      rounding: true,
    });
  }

  slide.addText(String(slideData.stat.value), {
    x: numberX,
    y: 2.2,
    w: numberW,
    h: 2.1,
    fontSize: hasImage ? 64 : 80,
    bold: true,
    color: COLORS.blue,
    align: hasImage ? "left" : "center",
    valign: "mid",
    margin: 0,
  });

  if (slideData.stat.label) {
    slide.addText(String(slideData.stat.label), {
      x: hasImage ? numberX : 1.7,
      y: 4.3,
      w: hasImage ? numberW : 9.95,
      h: 0.7,
      fontSize: 18,
      color: COLORS.dark,
      align: hasImage ? "left" : "center",
      valign: "mid",
      margin: 0,
    });
  }

  if (slideData.content?.[0]) {
    slide.addText(String(slideData.content[0]), {
      x: hasImage ? numberX : 1.7,
      y: 5.1,
      w: hasImage ? numberW : 9.95,
      h: 0.9,
      fontSize: 13,
      color: COLORS.gray,
      align: hasImage ? "left" : "center",
      valign: "top",
      margin: 0,
    });
  }
};

const RENDERERS = {
  bullets: renderBulletsSlide,
  chart: renderChartSlide,
  process: renderProcessSlide,
  comparison: renderComparisonSlide,
  stats: renderStatsSlide,
};

// --------------------------------------------------
// Title slide (unchanged design)
// --------------------------------------------------
const addTitleSlide = (pptx, presentation) => {
  const titleSlide = pptx.addSlide();
  titleSlide.background = { color: COLORS.navy };

  titleSlide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 13.33,
    h: 0.18,
    fill: { color: COLORS.accent },
    line: { color: COLORS.accent },
  });

  titleSlide.addText("DRAG.ai", {
    x: 0.7,
    y: 0.65,
    w: 2,
    h: 0.4,
    fontSize: 18,
    bold: true,
    color: COLORS.accent,
    margin: 0,
  });

  titleSlide.addText(String(presentation.title || "AI Presentation"), {
    x: 0.8,
    y: 2.15,
    w: 11.7,
    h: 1.2,
    fontSize: 38,
    bold: true,
    color: COLORS.white,
    align: "center",
    valign: "mid",
    margin: 0,
  });

  titleSlide.addText(String(presentation.topic || ""), {
    x: 1.2,
    y: 3.55,
    w: 10.9,
    h: 0.6,
    fontSize: 18,
    color: "CBD5E1",
    align: "center",
    margin: 0,
  });

  titleSlide.addText(`Prepared for: ${presentation.audience || "General Audience"}`, {
    x: 1.2,
    y: 4.35,
    w: 10.9,
    h: 0.4,
    fontSize: 13,
    color: "94A3B8",
    align: "center",
    margin: 0,
  });

  titleSlide.addText("Generated with DRAG.ai", {
    x: 0.7,
    y: 6.85,
    w: 4,
    h: 0.3,
    fontSize: 10,
    color: "94A3B8",
    margin: 0,
  });
};

const MAX_GENERATED_IMAGES = Number(process.env.PPT_MAX_IMAGES) || 4;
const IMAGE_ELIGIBLE_TYPES = ["bullets", "stats"];

const defaultImagePrompt = (slideData, presentation) =>
  `${slideData.title}${presentation.topic ? ` — ${presentation.topic}` : ""}, professional presentation illustration, clean minimalist digital art, no text`;

// Best-effort: generate illustrations for a handful of eligible slides.
// Skips entirely (fast no-op) when HF_TOKEN isn't configured. Never
// throws — a failed image just means that slide renders without one.
const attachSlideImages = async (presentation) => {
  if (!process.env.HF_TOKEN) return;

  let generated = 0;
  for (const slideData of presentation.slides) {
    if (generated >= MAX_GENERATED_IMAGES) break;
    if (!IMAGE_ELIGIBLE_TYPES.includes(slideData.type)) continue;

    const prompt = slideData.imagePrompt || defaultImagePrompt(slideData, presentation);

    try {
      const image = await generateSlideImage(prompt);
      if (image) {
        slideData._image = image;
        generated += 1;
      }
    } catch (error) {
      console.error(`Skipping image for slide "${slideData.title}":`, error.message);
    }
  }
};

const createPPTFile = async (presentation) => {
  const pptx = new pptxgen();

  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "DRAG.ai";
  pptx.company = "DRAG.ai";
  pptx.subject = presentation.topic;
  pptx.title = presentation.title;
  pptx.theme = {
    headFontFace: "Aptos Display",
    bodyFontFace: "Aptos",
    lang: "en-US",
  };

  await attachSlideImages(presentation);

  addTitleSlide(pptx, presentation);

  presentation.slides.forEach((slideData, index) => {
    const slide = pptx.addSlide();
    addSlideChrome(pptx, slide, index, slideData.title);

    const renderer = RENDERERS[slideData.type] || renderBulletsSlide;
    try {
      renderer(pptx, slide, slideData);
    } catch (error) {
      // If a rich layout fails for any unforeseen reason, never let it
      // take down the whole PPT — fall back to a plain bullet slide.
      console.error(`Failed to render "${slideData.type}" slide, falling back to bullets:`, error.message);
      renderBulletsSlide(pptx, slide, { content: slideData.content || [slideData.title] });
    }
  });

  const fileName = `DRAG_AI_${Date.now()}.pptx`;

  await pptx.writeFile({
    fileName,
    compression: true,
  });

  return { fileName };
};

module.exports = {
  createPPTFile,
};
