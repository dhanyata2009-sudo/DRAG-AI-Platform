
export const buildScriptGenerationRequest = (project) => {
  const details = {
    projectName: project.projectName,
    productName: project.productName,
    brandName: project.brandName,
    productDescription: project.productDescription || project.description,
    targetAudience: project.targetAudience,
    marketingGoal: project.marketingGoal,
    platform: project.platform,
    adStyle: project.adStyle,
    tone: project.tone,
    language: project.language,
    videoDuration: project.videoDuration || project.duration,
    voice: project.voice?.name || null,
    callToAction: project.callToAction || project.cta,
  };

  const detailLines = Object.entries(details)
    .filter(([, value]) => value)
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");

  return {
    projectId: project.projectId,
    prompt: `Generate a script for this video advertisement using the project details provided by the user. Consider the product, brand, product description, target audience, marketing goal, platform, ad style, tone, language, video duration, voice and call-to-action.\n\n${detailLines}`,
    project: details,
  };
};


export const buildVideoGenerationRequest = (
  project
) => ({
  projectId: project.projectId,

  product: {
    name: project.productName,
    brand: project.brandName,
    description:
      project.productDescription,
    imageUrl:
      project.productImageUrl || null,
  },

  advertisement: {
    style: project.adStyle,
    platform: project.platform,
    tone: project.tone,
    language: project.language,
    duration: project.duration,
    callToAction: project.cta,
  },

  script: project.script,

  avatar: project.avatar || null,

  voice: project.voice || null,
});

export const buildPPTGenerationRequest = (presentation) => {
  return {
    title: presentation.title,
    topic: presentation.topic,
    slideCount: Number(presentation.slideCount) || 6,
    audience: presentation.targetAudience,
  };
  const detailLines = Object.entries(details)
    .filter(([, value]) => value)
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");

  return {
    prompt: `Create a presentation using the details provided by the user. Organize the content into a clear slide-by-slide structure with concise titles, useful supporting points and a logical narrative. Do not invent facts that are not supported by the supplied content.\n\n${detailLines}`,
    presentation: details,
  };
};
