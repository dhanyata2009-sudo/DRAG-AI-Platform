import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Button from "../components/common/Button";
import AvatarSelector from "../components/AvatarSelector";
import { useProjectCreation } from "../hooks/useProjectCreation";
import { ROUTES } from "../utils/constants";
import { updateProject } from "../services/projectService";

const AvatarSelectionPage = () => {
  const navigate = useNavigate();
  const { data, updateData } = useProjectCreation();

  const handleSelect = (avatar) => updateData({ avatar });

  const handleContinue = async () => {
    if (!data.avatar || !data.projectId) return;

    try {
      const generatedAudio = {
        name: "HeyGen generated audio",
        provider: "heygen-video-1",
        mode: "automatic",
      };
      await updateProject(data.projectId, {
        avatar: data.avatar,
        voice: generatedAudio,
        currentStep: "generating",
      });
      updateData({ voice: generatedAudio });
      navigate(ROUTES.GENERATE);
    } catch (error) {
      console.error("AVATAR SAVE ERROR:", error);
      alert(error.response?.data?.error || "Unable to save avatar selection.");
    }
  };

  return (
    <div>
      <div className="mb-7">
        <h2 className="font-display text-2xl font-semibold text-body">Choose your AI avatar</h2>
        <p className="text-subtle text-sm mt-1">This creator will perform the advertisement on camera.</p>
      </div>

      <AvatarSelector selectedAvatar={data.avatar} onSelect={handleSelect} />

      <div className="flex justify-between mt-8">
        <button onClick={() => navigate(ROUTES.CREATE_PROJECT)} className="inline-flex items-center gap-1.5 text-sm text-subtle hover:text-body font-medium">
          <ArrowLeft size={15} /> Back
        </button>
        <Button onClick={handleContinue} disabled={!data.avatar} icon={ArrowRight} iconPosition="right">
          Continue
        </Button>
      </div>
    </div>
  );
};

export default AvatarSelectionPage;
