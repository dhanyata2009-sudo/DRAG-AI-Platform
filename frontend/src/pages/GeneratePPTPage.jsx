import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  Download,
  Eye,
  FileText,
  LayoutTemplate,
  Loader2,
  Presentation,
  Sparkles,
} from "lucide-react";

import Button from "../components/common/Button";
import Card from "../components/common/Card";
import SlidePreviewModal from "../components/common/SlidePreviewModal";
import { usePPTCreation } from "../hooks/usePPTCreation";
import { useWorkspace } from "../hooks/useWorkspace";
import { buildPPTGenerationRequest } from "../utils/generationRequests";
import { generatePresentation } from "../services/presentationService";
import { ROUTES } from "../utils/constants";

const stages = [
  {
    icon: FileText,
    label: "Structuring presentation content",
    description: "Organizing your topic and generating slide content",
  },
  {
    icon: LayoutTemplate,
    label: "Creating slide layouts",
    description: "Designing layouts, diagrams and visual elements",
  },
  {
    icon: Sparkles,
    label: "Preparing the final PPT file",
    description: "Building and packaging your PowerPoint presentation",
  },
];

const GeneratePPTPage = () => {
  const navigate = useNavigate();
  const { data, selectedSourceFile } = usePPTCreation();
  const { upsertPresentation } = useWorkspace();

  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState(0);
  const [notice, setNotice] = useState("");
  const [fileName, setFileName] = useState("");
  const [slides, setSlides] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  const request = useMemo(() => buildPPTGenerationRequest(data), [data]);

  const downloadHref = fileName
    ? `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"}/presentations/download/${fileName}`
    : "";

  useEffect(() => {
    if (!loading) return;

    setStage(0);

    const timer1 = setTimeout(() => {
      setStage(1);
    }, 3500);

    const timer2 = setTimeout(() => {
      setStage(2);
    }, 7500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [loading]);

  const requestGeneration = async () => {
    try {
      setLoading(true);
      setStage(0);
      setNotice("Generating your PPT...");
      setFileName("");

      const result = await generatePresentation({
        ...request,
        presentationId: data.presentationId,
        sourceFile: selectedSourceFile,
      });

      if (!result.success) {
        throw new Error(result.message || "PPT generation failed");
      }

      const generatedFileName = result.presentation?.fileName;

      if (!generatedFileName) {
        throw new Error("PPT was generated but the file name was not returned.");
      }

      setStage(2);

      upsertPresentation(result.presentation);
      setSlides(result.presentation?.slides || result.file?.slides || []);
      setFileName(generatedFileName);
      setNotice("PPT generated successfully. Preview it or download below.");
    } catch (error) {
      console.error("PPT generation error:", error);
      setNotice(
        error.response?.data?.message ||
          error.message ||
          "Failed to generate PPT."
      );
    } finally {
      setLoading(false);
    }
  };

  const progress = loading ? Math.min((stage + 1) * 33, 99) : fileName ? 100 : 0;

  return (
    <div className="space-y-6">
      <div>
        <Button
          variant="ghost"
          icon={ArrowLeft}
          onClick={() => navigate(ROUTES.CREATE_PPT)}
        >
          Back
        </Button>

        <div className="mt-5">
          <h2 className="font-display text-2xl font-semibold text-body">
            Generate your presentation
          </h2>

          <p className="text-subtle text-sm mt-1">
            DRAG.ai will create your presentation automatically.
          </p>
        </div>
      </div>

      <Card className="p-6">
        <h3 className="font-semibold text-body mb-5">
          Presentation details
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs text-subtle">Title</p>
            <p className="mt-1 font-medium text-body">{data.title}</p>
          </div>

          <div>
            <p className="text-xs text-subtle">Topic</p>
            <p className="mt-1 font-medium text-body">{data.topic}</p>
          </div>

          <div>
            <p className="text-xs text-subtle">Number of slides</p>
            <p className="mt-1 font-medium text-body">{data.slideCount}</p>
          </div>

          <div>
            <p className="text-xs text-subtle">Target audience</p>
            <p className="mt-1 font-medium text-body">
              {data.targetAudience}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-panel-2">
            <Presentation size={22} />
          </div>

          <div>
            <h3 className="font-semibold text-body">
              {loading ? "Creating your presentation" : "Ready to generate"}
            </h3>

            <p className="text-sm text-subtle">
              {loading
                ? "Please wait while DRAG.ai builds your presentation."
                : "AI will create the slide content and professional PPT design."}
            </p>
          </div>
        </div>

        {!loading && !fileName && (
          <Button onClick={requestGeneration} icon={Sparkles}>
            Generate PPT
          </Button>
        )}

        {loading && (
          <div className="space-y-6">

            {/* Progress header */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-body">
                  {stages[stage].label}
                </p>

                <p className="text-xs text-subtle mt-1">
                  {stages[stage].description}
                </p>
              </div>

              <span className="text-sm font-semibold text-body">
                {progress}%
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 rounded-full bg-panel-2 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-brand transition-all duration-1000 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Loading stages */}
            <div className="space-y-3">
              {stages.map((item, index) => {
                const Icon = item.icon;
                const completed = index < stage;
                const active = index === stage;

                return (
                  <div
                    key={item.label}
                    className={`flex items-center gap-4 rounded-xl border p-4 transition-all duration-500 ${
                      active
                        ? "border-app bg-panel-2 shadow-sm"
                        : completed
                        ? "border-subtle"
                        : "border-subtle opacity-50"
                    }`}
                  >
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-xl ${
                        active
                          ? "bg-gradient-brand text-white"
                          : completed
                          ? "bg-panel-2 text-body"
                          : "bg-panel-2 text-subtle"
                      }`}
                    >
                      {completed ? (
                        <Check size={20} />
                      ) : active ? (
                        <Loader2 size={20} className="animate-spin" />
                      ) : (
                        <Icon size={20} />
                      )}
                    </div>

                    <div className="flex-1">
                      <p className="text-sm font-medium text-body">
                        {item.label}
                      </p>

                      <p className="text-xs text-subtle mt-1">
                        {completed
                          ? "Completed"
                          : active
                          ? item.description
                          : "Waiting..."}
                      </p>
                    </div>

                    {active && (
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-body animate-bounce" />
                        <span
                          className="w-1.5 h-1.5 rounded-full bg-body animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        />
                        <span
                          className="w-1.5 h-1.5 rounded-full bg-body animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Current status */}
            <div className="flex items-center justify-center gap-2 pt-2">
              <Loader2 size={16} className="animate-spin text-subtle" />
              <p className="text-sm text-subtle">
                {stages[stage].label}...
              </p>
            </div>
          </div>
        )}

        {notice && !loading && (
          <div className="mt-5 rounded-xl border border-subtle p-4">
            <p className="text-sm text-body">{notice}</p>
          </div>
        )}

        {fileName && (
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowPreview(true)}
              className="inline-flex items-center gap-2 rounded-xl px-5 py-3 font-medium text-body border border-app hover:bg-panel-2 transition"
            >
              <Eye size={18} />
              Preview
            </button>

            <a
              href={downloadHref}
              download
              className="inline-flex items-center gap-2 rounded-xl px-5 py-3 font-medium text-white bg-gradient-brand hover:opacity-90 transition"
            >
              <Download size={18} />
              Download PPT
            </a>
          </div>
        )}
      </Card>

      {showPreview && (
        <SlidePreviewModal
          title={data.title}
          slides={slides}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
};

export default GeneratePPTPage;