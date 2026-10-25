import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Eye,
  FileText,
  LayoutTemplate,
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
  { icon: FileText, label: "Structuring presentation content" },
  { icon: LayoutTemplate, label: "Creating slide layouts" },
  { icon: Sparkles, label: "Preparing the final PPT file" },
];

const GeneratePPTPage = () => {
  const navigate = useNavigate();
  const { data } = usePPTCreation();
  const { upsertPresentation } = useWorkspace();

  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [fileName, setFileName] = useState("");
  const [slides, setSlides] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  const request = useMemo(() => buildPPTGenerationRequest(data), [data]);
  const downloadHref = fileName
    ? `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"}/presentations/download/${fileName}`
    : "";

  const requestGeneration = async () => {
    try {
      setLoading(true);
      setNotice("Generating your PPT...");
      setFileName("");

      const result = await generatePresentation({
        ...request,
        presentationId: data.presentationId,
      });

      if (!result.success) {
        throw new Error(result.message || "PPT generation failed");
      }

      const generatedFileName = result.presentation?.fileName;

      if (!generatedFileName) {
        throw new Error("PPT was generated but the file name was not returned.");
      }

      upsertPresentation(result.presentation);
      setSlides(result.presentation?.slides || result.file?.slides || []);
      setFileName(generatedFileName);
      setNotice("PPT generated successfully. Preview it or download below.");
    } catch (error) {
      console.error("PPT generation error:", error);
      setNotice(error.response?.data?.message || error.message || "Failed to generate PPT.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" icon={ArrowLeft} onClick={() => navigate(ROUTES.CREATE_PPT)}>
          Back
        </Button>

        <div className="mt-5">
          <h2 className="font-display text-2xl font-semibold text-body">Generate your presentation</h2>
          <p className="text-subtle text-sm mt-1">DRAG.ai will create your presentation automatically.</p>
        </div>
      </div>

      <Card className="p-6">
        <h3 className="font-semibold text-body mb-5">Presentation details</h3>
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
            <p className="mt-1 font-medium text-body">{data.targetAudience}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Presentation size={22} />
          <div>
            <h3 className="font-semibold text-body">Ready to generate</h3>
            <p className="text-sm text-subtle">AI will create the slide content and professional PPT design.</p>
          </div>
        </div>

        {!loading && !fileName && (
          <Button onClick={requestGeneration} icon={Sparkles}>
            Generate PPT
          </Button>
        )}

        {loading && (
          <div className="space-y-4">
            {stages.map((stage, index) => {
              const Icon = stage.icon;
              return (
                <div key={stage.label} className="flex items-center gap-3">
                  <Icon size={20} />
                  <span className="text-sm text-body">{stage.label}</span>
                  {index === 0 && <span className="text-xs text-subtle">...</span>}
                </div>
              );
            })}
          </div>
        )}

        {notice && (
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
            <a href={downloadHref} download className="inline-flex items-center gap-2 rounded-xl px-5 py-3 font-medium text-white bg-gradient-brand hover:opacity-90 transition">
              <FileText size={18} />
              Download PPT
            </a>
          </div>
        )}
      </Card>

      {showPreview && (
        <SlidePreviewModal title={data.title} slides={slides} onClose={() => setShowPreview(false)} />
      )}
    </div>
  );
};

export default GeneratePPTPage;
