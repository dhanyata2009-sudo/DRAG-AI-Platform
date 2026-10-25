
import api from "./api";

export async function startAdPipeline({ script, projectId }) {
  if (!projectId) {
    throw new Error("Project ID is missing. Save your project first.");
  }

  const response = await api.post("/ad-pipeline/generate", {
    script,
    projectId,
  });

  return response.data;
}

export async function getAdPipelineStatus(jobId) {
  if (!jobId) {
    throw new Error("Generation job ID is missing.");
  }

  const response = await api.get(
    `/ad-pipeline/status/${encodeURIComponent(jobId)}`
  );

  return response.data;
}
