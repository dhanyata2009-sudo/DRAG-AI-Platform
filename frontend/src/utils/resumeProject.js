import { STORAGE_KEY } from "../context/ProjectCreationContext";
import { ROUTES } from "./constants";

export const resumeProject = (project) => {
  const draft = {
    projectId: project._id || project.id,
    projectName: project.projectName || project.name || "",
    productName: project.productName || "",
    brandName: project.brandName || project.brand || "",
    productDescription: project.productDescription || project.description || "",
    productImageUrl: project.productImageUrl || null,
    targetAudience: project.targetAudience || "",
    marketingGoal: project.marketingGoal || "",
    platform: project.platform || "Instagram",
    adStyle: project.adStyle || "UGC",
    tone: project.tone || "Friendly",
    language: project.language || "English",
    videoDuration: project.videoDuration || "30s",
    callToAction: project.callToAction || "",
    avatar: project.avatar || null,
    voice: project.voice || null,
    videoId: project.latestVideoId || null,
    videoUrl: project.videoUrl || null,
    generationStatus: project.generationStatus || "idle",
  };

  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));

  if (draft.videoId || draft.videoUrl) return ROUTES.PREVIEW;
  if (draft.voice) return ROUTES.GENERATE;
  if (draft.avatar) return ROUTES.GENERATE;
  return ROUTES.AVATAR;
};
