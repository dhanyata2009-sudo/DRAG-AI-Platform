import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  Film,
  Loader2,
  AlertCircle,
} from "lucide-react";

import Card from "../components/common/Card";
import Button from "../components/common/Button";
import { useProjectCreation } from "../hooks/useProjectCreation";
import { ROUTES } from "../utils/constants";
import { generateScript } from "../services/scriptService";
import { buildScriptGenerationRequest } from "../utils/generationRequests";
import { generateAndWaitForAd } from "../services/generateAndWaitForAd";

const statusLabels = {
  queued: "Preparing your advertisement...",
  generating_script: "Writing your advertisement...",
  generating_voice: "Generating the voice...",
  generating_creator_video: "Creating the AI creator scenes...",
  creating_product_scenes: "Creating product scenes...",
  assembling_video: "Assembling the final video...",
  processing: "Generating your AI advertisement...",
  completed: "Your AI advertisement is ready.",
  failed: "Video generation failed.",
};

const stages = [
  ["generating_script", "Writing script and planning scenes"],
  ["generating_creator_video", "Generating video and audio with HeyGen"],
  ["saving_video", "Saving your finished video"],
];

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const BACKEND_BASE = API_BASE.replace(/\/api\/?$/, "");

const getAbsoluteVideoUrl = (url) => {
  if (!url || typeof url !== "string") return null;

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  return `${BACKEND_BASE}/${url.replace(/^\/+/, "")}`;
};

const GenerateVideoPage = () => {
  const navigate = useNavigate();
  const { data, updateData } = useProjectCreation();

  const [status, setStatus] = useState(
    data.generationStatus || "queued"
  );
  const [error, setError] = useState("");
  const [starting, setStarting] = useState(false);

  // Prevent repeated starts during rerenders.
  const startedKeyRef = useRef("");

  useEffect(() => {
    const projectId = data.projectId;
    const avatarId = data.avatar?.id || data.avatar?.name;

    if (!projectId || !data.avatar) {
      navigate(ROUTES.CREATE_PROJECT, { replace: true });
      return;
    }

    const storageKey = `drag_ai_video_${projectId}`;
    const lockKey = `drag_ai_generation_started_${projectId}`;
    const completedKey = `drag_ai_generation_completed_${projectId}`;

    const savedVideoUrl = sessionStorage.getItem(storageKey);
    const currentVideoUrl = getAbsoluteVideoUrl(
      data.videoUrl || savedVideoUrl
    );

    // A completed video should always open Preview, not regenerate.
    if (
      data.generationStatus === "completed" &&
      currentVideoUrl
    ) {
      sessionStorage.setItem(storageKey, currentVideoUrl);
      navigate(ROUTES.PREVIEW, { replace: true });
      return;
    }

    // Resume to Preview if the URL was saved in this session.
    if (savedVideoUrl && sessionStorage.getItem(completedKey) === "true") {
      updateData({
        videoUrl: getAbsoluteVideoUrl(savedVideoUrl),
        downloadUrl: getAbsoluteVideoUrl(savedVideoUrl),
        generationStatus: "completed",
      });

      navigate(ROUTES.PREVIEW, { replace: true });
      return;
    }

    const startKey = `${projectId}:${avatarId || "avatar"}`;

    if (startedKeyRef.current === startKey) return;

    // If another instance already started this project, don't start
    // a second request from this component.
    if (sessionStorage.getItem(lockKey) === "started") {
      setStarting(false);
      setStatus("processing");
      setError(
        "Generation is already marked as started. Please wait for the current request to finish."
      );
      return;
    }

    startedKeyRef.current = startKey;
    sessionStorage.setItem(lockKey, "started");

    const start = async () => {
      try {
        setStarting(true);
        setError("");
        setStatus("queued");

        const projectForScript = {
          ...data,
          projectId,
          projectName: data.projectName,
          productName: data.productName,
          brandName: data.brandName,
          description: data.productDescription,
          targetAudience: data.targetAudience,
          marketingGoal: data.marketingGoal,
          platform: data.platform,
          adStyle: data.adStyle,
          tone: data.tone,
          language: data.language,
          duration: data.videoDuration,
          voice: null,
          cta: data.callToAction,
        };

        setStatus("generating_script");

        const scriptRequest =
          buildScriptGenerationRequest(projectForScript);

        const scriptResponse = await generateScript(scriptRequest);

        const scriptData =
          scriptResponse?.data ??
          scriptResponse?.script ??
          scriptResponse;

        const script =
          (typeof scriptResponse?.generatedScript === "string" &&
            scriptResponse.generatedScript) ||
          (typeof scriptResponse?.script === "string" &&
            scriptResponse.script) ||
          (typeof scriptData?.generatedScript === "string" &&
            scriptData.generatedScript) ||
          (typeof scriptData?.script === "string" &&
            scriptData.script) ||
          (typeof scriptData?.text === "string" &&
            scriptData.text) ||
          (typeof scriptData?.content === "string" &&
            scriptData.content) ||
          (typeof scriptData?.script?.generatedScript === "string" &&
            scriptData.script.generatedScript) ||
          (typeof scriptData?.script?.script === "string" &&
            scriptData.script.script);

        if (typeof script !== "string" || !script.trim()) {
          throw new Error(
            "The script API returned no usable text. Check the backend response."
          );
        }

        const cleanScript = script.trim();
        updateData({ generatedScript: cleanScript });

        const result = await generateAndWaitForAd({
          script: cleanScript,
          productName: data.productName,
          productDescription: data.productDescription,
          projectId,
          onProgress: (job) => {
            setStatus(job.status || "processing");

            updateData({
              generationStatus: job.status || "processing",
            });
          },
        });

        const rawVideoUrl =
          result?.videoUrl ||
          result?.downloadUrl ||
          result?.job?.videoUrl ||
          result?.job?.downloadUrl;

        if (!rawVideoUrl) {
          throw new Error(
            "The server did not return the final video URL."
          );
        }

        const videoUrl = getAbsoluteVideoUrl(rawVideoUrl);
        const downloadUrl = getAbsoluteVideoUrl(
          result?.downloadUrl || rawVideoUrl
        );

        // Persist the URL before navigating to Preview.
        sessionStorage.setItem(storageKey, videoUrl);
        sessionStorage.setItem(completedKey, "true");
        sessionStorage.removeItem(lockKey);

        updateData({
          videoUrl,
          downloadUrl,
          video: result?.job || result?.video || null,
          generationStatus: "completed",
        });

        setStatus("completed");
        navigate(ROUTES.PREVIEW, { replace: true });
      } catch (err) {
        console.error("VIDEO GENERATION ERROR:", err);

        const message =
          err.response?.data?.error ||
          err.response?.data?.message ||
          err.message ||
          "Unable to generate your advertisement.";

        sessionStorage.removeItem(lockKey);
        sessionStorage.removeItem(completedKey);
        startedKeyRef.current = "";

        setError(message);
        setStatus("failed");

        updateData({ generationStatus: "failed" });
      } finally {
        setStarting(false);
      }
    };

    start();

    // Intentionally do not cancel the generation promise during cleanup.
    // Progress updates change project state, and React Strict Mode can
    // run effect cleanup/setup during development.
  }, [
    data.projectId,
    data.avatar,
    navigate,
    updateData,
  ]);

  const currentIndex = stages.findIndex(([key]) => key === status);

  return (
    <div className="flex flex-col items-center text-center py-12">
      <div className="h-16 w-16 rounded-2xl bg-gradient-brand flex items-center justify-center text-white mb-6">
        {status === "completed" ? (
          <CheckCircle2 size={30} />
        ) : status === "failed" ? (
          <AlertCircle size={30} />
        ) : (
          <Loader2 size={28} className="animate-spin" />
        )}
      </div>

      <h2 className="font-display text-2xl font-semibold text-body">
        {statusLabels[status] ||
          (starting
            ? "Starting your AI advertisement..."
            : "Creating your AI advertisement...")}
      </h2>

      <p className="text-subtle text-sm mt-2 max-w-lg">
        DRAG.ai is generating your ad with HeyGen Video 1, including the scene and audio.
      </p>

      <Card className="w-full max-w-xl mt-8 p-6 text-left">
        <h3 className="font-semibold text-body">
          Generation progress
        </h3>

        <div className="mt-5 space-y-4">
          {stages.map(([key, label], index) => {
            const done =
              currentIndex > index || status === "completed";
            const active = key === status;

            return (
              <div key={key} className="flex items-center gap-3">
                <span
                  className={`h-8 w-8 rounded-full flex items-center justify-center border ${
                    done
                      ? "bg-violet-600 border-violet-600 text-white"
                      : active
                        ? "border-violet-500 text-violet-500"
                        : "border-app text-faint"
                  }`}
                >
                  {done ? (
                    <CheckCircle2 size={15} />
                  ) : active ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Film size={14} />
                  )}
                </span>

                <span
                  className={`text-sm ${
                    done || active ? "text-body" : "text-faint"
                  }`}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>

        {error && (
          <p className="mt-6 text-sm text-rose-400">{error}</p>
        )}

        {data.videoUrl && (
          <Button
            className="mt-5"
            onClick={() => navigate(ROUTES.PREVIEW)}
          >
            Preview generated video
          </Button>
        )}
      </Card>
    </div>
  );
};

export default GenerateVideoPage;