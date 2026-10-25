
import {
  startAdPipeline,
  getAdPipelineStatus,
} from "./adPipelineService";

const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export async function generateAndWaitForAd({
  script,
  projectId,
  onProgress,
}) {
  const startedResponse = await startAdPipeline({
    script,
    projectId,
  });

  const started = startedResponse?.data ?? startedResponse;
  const jobId = started?.jobId;

  if (!jobId) {
    throw new Error(
      started?.message ||
        "The server did not return a generation job ID."
    );
  }

  const timeoutMs = 15 * 60 * 1000;
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    await sleep(4000);

    const statusResponse = await getAdPipelineStatus(jobId);
    const job = statusResponse?.data ?? statusResponse;

    onProgress?.(job);

    if (job.status === "completed") {
      if (!job.videoUrl) {
        throw new Error(
          "Generation completed, but the final video URL is missing."
        );
      }

      return {
        videoUrl: job.videoUrl,
        downloadUrl: job.downloadUrl || job.videoUrl,
        job,
      };
    }

    if (job.status === "failed") {
      throw new Error(
        job.error ||
          job.message ||
          "Video generation failed."
      );
    }
  }

  throw new Error(
    "Video generation is taking too long. Check the backend logs before retrying."
  );
}
