import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import Button from "../components/common/Button";
import Card from "../components/common/Card";
import { Field, Input, Select } from "../components/common/FormFields";
import { usePPTCreation } from "../hooks/usePPTCreation";
import { useWorkspace } from "../hooks/useWorkspace";
import { ROUTES } from "../utils/constants";

const CreatePPTPage = () => {
  const navigate = useNavigate();
  const { data, updateData } = usePPTCreation();
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