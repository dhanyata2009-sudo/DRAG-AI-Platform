import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Presentation } from "lucide-react";
import Button from "../components/common/Button";
import Card from "../components/common/Card";
import { Textarea } from "../components/common/FormFields";
import { usePPTCreation } from "../hooks/usePPTCreation";
import { buildPPTGenerationRequest } from "../utils/generationRequests";
import { ROUTES } from "../utils/constants";

const PPTContentPage = () => {
  const navigate = useNavigate();
  const { data, updateData } = usePPTCreation();
  const request = useMemo(() => buildPPTGenerationRequest(data), [data]);

  return (
    <div>
      <div className="mb-7">
        <h2 className="font-display text-2xl font-semibold text-body">Review presentation content</h2>
        <p className="text-subtle text-sm mt-1">The prompt below is generated only from the information you entered.</p>
      </div>

      <Card className="p-6 sm:p-8">
        <div className="flex items-center gap-2 text-xs font-mono text-violet-400">
          <Presentation size={14} /> BACKEND REQUEST PROMPT
        </div>
        <Textarea rows={13} value={request.prompt} readOnly className="mt-3 font-mono text-[13px] leading-relaxed" />
      </Card>

      <Card className="mt-5 p-6 sm:p-8">
        <label htmlFor="outline" className="font-display font-semibold text-body">Optional slide outline</label>
        <p className="mt-1 text-sm text-subtle">Add your own slide order, or leave this empty for the backend to create the outline.</p>
        <Textarea
          id="outline"
          rows={9}
          value={data.outline}
          onChange={(event) => updateData({ outline: event.target.value })}
          placeholder="Slide 1: Title\nSlide 2: Introduction\nSlide 3: …"
          className="mt-4 font-mono text-[13px] leading-relaxed"
        />
      </Card>

      <div className="flex justify-between mt-8">
        <button onClick={() => navigate(ROUTES.CREATE_PPT)} className="inline-flex items-center gap-1.5 text-sm font-medium text-subtle hover:text-body">
          <ArrowLeft size={15} /> Back
        </button>
        <Button onClick={() => navigate(ROUTES.GENERATE_PPT)} icon={ArrowRight} iconPosition="right">Continue</Button>
      </div>
    </div>
  );
};

export default PPTContentPage;
