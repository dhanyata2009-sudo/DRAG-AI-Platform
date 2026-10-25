import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

const TYPE_LABELS = {
  bullets: "Bullets",
  chart: "Chart",
  process: "Process",
  comparison: "Comparison",
  stats: "Highlight",
};

const CHART_BAR_COLORS = ["bg-blue-500", "bg-sky-400", "bg-violet-500", "bg-amber-400", "bg-emerald-500"];

const ChartPreview = ({ chart }) => {
  if (!chart?.categories?.length || !chart?.series?.length) return null;
  const series = chart.series[0];
  const max = Math.max(...series.values, 1);

  return (
    <div className="space-y-2.5">
      {chart.categories.map((category, i) => (
        <div key={category} className="flex items-center gap-3">
          <span className="w-24 shrink-0 text-xs text-subtle truncate">{category}</span>
          <div className="flex-1 h-3 rounded-full bg-panel-2 overflow-hidden">
            <div
              className={`h-full rounded-full ${CHART_BAR_COLORS[i % CHART_BAR_COLORS.length]}`}
              style={{ width: `${Math.max(6, (series.values[i] / max) * 100)}%` }}
            />
          </div>
          <span className="w-10 shrink-0 text-xs text-faint text-right">{series.values[i]}</span>
        </div>
      ))}
    </div>
  );
};

const ProcessPreview = ({ steps }) => {
  if (!steps?.length) return null;
  return (
    <div className="flex items-start gap-2 overflow-x-auto pb-1">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center gap-2 shrink-0">
          <div className="w-28 rounded-xl border border-app bg-panel-2 p-2.5 text-center">
            <div className="mx-auto mb-1 flex h-6 w-6 items-center justify-center rounded-full bg-violet-500 text-[11px] font-semibold text-white">
              {i + 1}
            </div>
            <p className="text-xs font-medium text-body leading-snug">{step.label}</p>
            {step.description && (
              <p className="mt-1 text-[10px] text-subtle leading-snug">{step.description}</p>
            )}
          </div>
          {i < steps.length - 1 && <ChevronRight size={16} className="text-faint shrink-0" />}
        </div>
      ))}
    </div>
  );
};

const ComparisonPreview = ({ columns }) => {
  if (!columns || columns.length !== 2) return null;
  return (
    <div className="grid grid-cols-2 gap-3">
      {columns.map((col, i) => (
        <div key={i} className="rounded-xl border border-app overflow-hidden">
          <div className={`px-3 py-1.5 text-xs font-semibold text-white ${i === 0 ? "bg-blue-600" : "bg-violet-600"}`}>
            {col.heading}
          </div>
          <ul className="p-3 space-y-1.5 bg-panel-2">
            {(col.points || []).map((point, j) => (
              <li key={j} className="text-xs text-subtle flex gap-1.5">
                <span className="text-faint">&bull;</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

const StatsPreview = ({ stat }) => {
  if (!stat?.value) return null;
  return (
    <div className="text-center py-2">
      <p className="font-display text-5xl font-bold text-blue-500">{stat.value}</p>
      {stat.label && <p className="mt-2 text-sm text-body">{stat.label}</p>}
    </div>
  );
};

const SlideBody = ({ slide }) => {
  const type = slide.type || "bullets";

  if (type === "chart" && slide.chart) return <ChartPreview chart={slide.chart} />;
  if (type === "process" && slide.steps) return <ProcessPreview steps={slide.steps} />;
  if (type === "comparison" && slide.columns) return <ComparisonPreview columns={slide.columns} />;
  if (type === "stats" && slide.stat) return <StatsPreview stat={slide.stat} />;

  return (
    <ul className="space-y-2">
      {(slide.content || []).map((point, i) => (
        <li key={i} className="text-sm text-subtle flex gap-2">
          <span className="text-violet-400">&bull;</span>
          <span>{point}</span>
        </li>
      ))}
    </ul>
  );
};

const SlidePreviewModal = ({ title, slides, onClose }) => {
  const [index, setIndex] = useState(0);
  if (!slides?.length) return null;
  const slide = slides[index];
  const typeLabel = TYPE_LABELS[slide.type] || "Bullets";

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-panel rounded-2xl max-w-2xl w-full p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-faint hover:text-body" aria-label="Close preview">
          <X size={20} />
        </button>

        <p className="text-xs text-faint mb-1">{title}</p>
        <div className="flex items-center gap-2 mb-4">
          <p className="text-xs text-faint">Slide {index + 1} of {slides.length}</p>
          <span className="text-[10px] uppercase tracking-wide font-semibold text-violet-400 bg-violet-500/10 rounded-full px-2 py-0.5">
            {typeLabel}
          </span>
        </div>

        <div className="rounded-xl border border-app bg-panel-2 p-8 aspect-video flex flex-col justify-center overflow-hidden">
          <h3 className="font-display text-xl font-semibold text-body mb-4">{slide.title}</h3>
          <SlideBody slide={slide} />
        </div>

        <div className="flex items-center justify-between mt-5">
          <button
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            disabled={index === 0}
            className="inline-flex items-center gap-1 text-sm text-subtle hover:text-body disabled:opacity-30"
          >
            <ChevronLeft size={16} /> Previous
          </button>
          <button
            onClick={() => setIndex((i) => Math.min(slides.length - 1, i + 1))}
            disabled={index === slides.length - 1}
            className="inline-flex items-center gap-1 text-sm text-subtle hover:text-body disabled:opacity-30"
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SlidePreviewModal;
