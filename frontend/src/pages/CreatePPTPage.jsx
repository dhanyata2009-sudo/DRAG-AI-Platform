import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, FileText, UploadCloud, X } from "lucide-react";

import Button from "../components/common/Button";
import Card from "../components/common/Card";
import { Field, Input, } from "../components/common/FormFields";
import { usePPTCreation } from "../hooks/usePPTCreation";
import { useWorkspace } from "../hooks/useWorkspace";
import { ROUTES } from "../utils/constants";

const CreatePPTPage = () => {
  const navigate = useNavigate();
  const { data, updateData,selectedSourceFile, setSelectedSourceFile  } = usePPTCreation();
  const { createPresentation } = useWorkspace();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    updateData({ [event.target.name]: event.target.value });
  };

  const handleSlideCountBlur = () => {
    const n = Math.min(30, Math.max(3, Math.round(Number(data.slideCount) || 6)));
    updateData({ slideCount: String(n) });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!data.title.trim() || !data.topic.trim() || !data.targetAudience.trim()) {
      return;
    }

    setLoading(true);
    setError("");
    try {
      const presentation = await createPresentation({
        title: data.title,
        topic: data.topic,
        targetAudience: data.targetAudience,
        slideCount: Math.min(30, Math.max(3, Math.round(Number(data.slideCount) || 6))),
      });
      updateData({ presentationId: presentation._id });
      navigate(ROUTES.GENERATE_PPT);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save presentation details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-7">
        <h2 className="font-display text-2xl font-semibold text-body">Plan your presentation</h2>
        <p className="text-subtle text-sm mt-1">Enter the basic details and let DRAG.ai create the presentation.</p>
      </div>

      <Card className="p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Presentation title" required id="title">
              <Input id="title" name="title" required placeholder="e.g. Introduction to Artificial Intelligence" value={data.title} onChange={handleChange} />
            </Field>
            <Field label="Topic" required id="topic">
              <Input id="topic" name="topic" required placeholder="e.g. AI/ML causes and effects" value={data.topic} onChange={handleChange} />
            </Field>
            <Field label="Number of slides" id="slideCount">
              <Input id="slideCount" name="slideCount" type="number" min={3} max={30} step={1} inputMode="numeric" placeholder="3 - 30" value={data.slideCount} onChange={handleChange} onBlur={handleSlideCountBlur} />
            </Field>
            <Field label="Target audience" required id="targetAudience">
              <Input id="targetAudience" name="targetAudience" required placeholder="e.g. College students" value={data.targetAudience} onChange={handleChange} />
            </Field>
          </div>

                    <div className="space-y-2">
            <label htmlFor="ppt-source-file" className="mb-1.5 block text-sm font-medium text-body">Source material <span className="text-subtle font-normal">(optional)</span></label>
            <div className="rounded-xl border border-dashed border-app bg-panel-2/60 p-4 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-panel">
                    <FileText size={20} className="text-subtle" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-body">Ground the presentation in your own content</p>
                    <p className="mt-1 text-xs text-subtle">Upload a PDF, photo, or article file. Relevant passages are retrieved and prioritized.</p>
                    <p className="mt-1 text-xs text-subtle">PDF, PNG, JPG, WEBP, TXT, MD, CSV or HTML · up to 15 MB</p>
                  </div>
                </div>
                <label htmlFor="ppt-source-file" className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl border border-app bg-panel px-4 py-2.5 text-sm font-medium text-body transition hover:bg-panel-2">
                  <UploadCloud size={16} /> {selectedSourceFile ? "Replace file" : "Upload source"}
                </label>
                <input id="ppt-source-file" type="file" accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.md,.csv,.html,.htm,application/pdf,image/png,image/jpeg,image/webp,text/plain,text/markdown,text/csv,text/html" className="hidden" onChange={(event) => setSelectedSourceFile(event.target.files?.[0] || null)} />
              </div>
              {selectedSourceFile && (
                <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-app bg-panel px-3 py-2.5">
                  <div className="flex min-w-0 items-center gap-2">
                    <FileText size={16} className="shrink-0 text-subtle" />
                    <span className="truncate text-sm text-body">{selectedSourceFile.name}</span>
                    <span className="shrink-0 text-xs text-subtle">{(selectedSourceFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                  </div>
                  <button type="button" aria-label="Remove source file" onClick={() => { setSelectedSourceFile(null); const input = document.getElementById("ppt-source-file"); if (input) input.value = ""; }} className="rounded-lg p-1.5 text-subtle transition hover:bg-panel-2 hover:text-body"><X size={16} /></button>
                </div>
              )}
            </div>
          </div>


          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex justify-end">
            <Button type="submit" icon={ArrowRight} iconPosition="right" disabled={loading}>
              {loading ? "Saving..." : "Continue"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreatePPTPage;