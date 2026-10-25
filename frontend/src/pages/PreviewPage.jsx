import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Play,
  Maximize,
  Download,
  Share2,
  RefreshCw,
  History as HistoryIcon,
  Film,
} from "lucide-react";

import Card from "../components/common/Card";
import Button from "../components/common/Button";
import { useProjectCreation } from "../hooks/useProjectCreation";
import { ROUTES } from "../utils/constants";
import { useWorkspace } from "../hooks/useWorkspace";
import { useToast } from "../context/ToastContext";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const BACKEND_BASE = API_BASE.replace(/\/api\/?$/, "");

const getAbsoluteVideoUrl = (url) => {
  if (!url || typeof url !== "string") return null;

  if (/^https?:\/\//i.test(url)) return url;

  return `${BACKEND_BASE}/${url.replace(/^\/+/, "")}`;
};

const PreviewPage = () => {
  const navigate = useNavigate();

  const { data, clearData } = useProjectCreation();
  const { projects } = useWorkspace();
  const { showToast } = useToast();

  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [videoError, setVideoError] = useState(false);

  const savedProject = projects.find(
    (project) =>
      project._id === data.projectId ||
      project.id === data.projectId
  );

  const rawVideoUrl =
    data.videoUrl ||
    data.video?.videoUrl ||
    data.video?.downloadUrl ||
    data.video?.url ||
    savedProject?.videoUrl ||
    savedProject?.video?.videoUrl ||
    savedProject?.video?.url ||
    savedProject?.video?.downloadUrl ||
    null;

  const videoUrl = getAbsoluteVideoUrl(rawVideoUrl);

  const rawDownloadUrl =
    data.downloadUrl ||
    data.video?.downloadUrl ||
    savedProject?.video?.downloadUrl ||
    rawVideoUrl;

  const downloadUrl = getAbsoluteVideoUrl(rawDownloadUrl);

  const projectName =
    data.projectName ||
    savedProject?.projectName ||
    savedProject?.name ||
    "DRAG.ai Video";

  const togglePlay = async () => {
    if (!videoRef.current || !videoUrl) return;

    try {
      if (videoRef.current.paused) {
        await videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    } catch (error) {
      console.error("VIDEO PLAY ERROR:", error);
    }
  };

  const downloadVideo = async () => {
    if (!downloadUrl) {
      showToast("Video is not available yet.", "info");
      return;
    }

    try {
      showToast("Preparing video download...", "info");

      const response = await fetch(downloadUrl);

      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`);
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");

      anchor.href = blobUrl;
      anchor.download = `${projectName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")}.mp4`;

      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      window.setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
      showToast("Video download started!", "success");
    } catch (error) {
      console.error("VIDEO DOWNLOAD ERROR:", error);
      window.open(downloadUrl, "_blank", "noopener,noreferrer");
      showToast(
        "Direct download failed. Opened the video instead.",
        "info"
      );
    }
  };

  const share = async () => {
    if (!videoUrl) {
      showToast("Video is not available yet.", "info");
      return;
    }

    try {
      if (navigator.share) {
        await navigator.share({
          title: projectName,
          text: "Check out my DRAG.ai generated video",
          url: videoUrl,
        });
      } else {
        await navigator.clipboard.writeText(videoUrl);
        showToast("Video link copied!", "success");
      }
    } catch (error) {
      if (error?.name !== "AbortError") {
        showToast("Sharing is unavailable.", "info");
      }
    }
  };

  const fullscreen = () => {
    if (videoRef.current?.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  const startAnother = () => {
    clearData();
    navigate(ROUTES.CREATE_PROJECT);
  };

  return (
    <div>
      <div className="mb-7 text-center">
        <h2 className="font-display text-2xl font-semibold text-body">
          {projectName} is ready 🎬
        </h2>

        <p className="text-subtle text-sm mt-1">
          Preview, download, or share your generated video.
        </p>
      </div>

      <div className="max-w-sm mx-auto">
        <Card className="p-4">
          <div className="relative aspect-[9/16] rounded-xl overflow-hidden bg-panel-2">
            {videoUrl && !videoError ? (
              <>
                <video
                  key={videoUrl}
                  ref={videoRef}
                  src={videoUrl}
                  className="w-full h-full object-cover"
                  controls
                  playsInline
                  preload="metadata"
                  onPlay={() => setPlaying(true)}
                  onPause={() => setPlaying(false)}
                  onEnded={() => setPlaying(false)}
                  onError={(event) => {
                    console.error(
                      "VIDEO LOAD ERROR:",
                      event.currentTarget.error,
                      "URL:",
                      videoUrl
                    );
                    setVideoError(true);
                  }}
                />

                {!playing && (
                  <button
                    type="button"
                    onClick={togglePlay}
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-16 w-16 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-violet-700 shadow-xl hover:scale-105 transition-transform"
                    aria-label="Play video"
                  >
                    <Play size={26} className="ml-1" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={fullscreen}
                  className="absolute bottom-3 right-3 h-9 w-9 rounded-lg bg-black/50 backdrop-blur flex items-center justify-center text-white"
                  aria-label="Fullscreen"
                >
                  <Maximize size={15} />
                </button>
              </>
            ) : (
              <div className="flex h-full w-full items-center justify-center text-faint p-5">
                <div className="text-center">
                  <Film size={36} className="mx-auto mb-2" />
                  <p className="text-sm">
                    {videoError
                      ? "The video URL was found, but the website could not load the video."
                      : "Video not available"}
                  </p>

                  {videoUrl && (
                    <a
                      href={videoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-block text-sm text-violet-500 underline"
                    >
                      Open video directly
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>

        <div className="grid grid-cols-3 gap-3 mt-5">
          <Button
            variant="secondary"
            icon={Download}
            size="sm"
            onClick={downloadVideo}
            disabled={!videoUrl || videoError}
          >
            Download
          </Button>

          <Button
            variant="secondary"
            icon={Share2}
            size="sm"
            onClick={share}
            disabled={!videoUrl}
          >
            Share
          </Button>

          <Button
            variant="secondary"
            icon={RefreshCw}
            size="sm"
            onClick={() => navigate(ROUTES.GENERATE)}
          >
            Regenerate
          </Button>
        </div>
      </div>

      <Card className="max-w-sm mx-auto mt-6 p-5">
        <h3 className="text-sm font-semibold text-body mb-3">
          Project summary
        </h3>

        <dl className="space-y-2 text-sm">
          {[
            [
              "Brand",
              data.brandName || savedProject?.brandName || "—",
            ],
            ["Avatar", data.avatar?.name || "—"],
            ["Voice", data.voice?.name || "—"],
            [
              "Language",
              data.language || savedProject?.language || "—",
            ],
            [
              "Platform",
              data.platform || savedProject?.platform || "—",
            ],
          ].map(([label, value]) => (
            <div
              key={label}
              className="flex justify-between gap-4"
            >
              <dt className="text-subtle">{label}</dt>
              <dd className="text-body font-medium text-right">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </Card>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-9">
        <Button
          as={Link}
          to={ROUTES.HISTORY}
          variant="ghost"
          icon={HistoryIcon}
        >
          View history
        </Button>

        <Button onClick={startAnother} icon={RefreshCw}>
          Start another project
        </Button>
      </div>
    </div>
  );
};

export default PreviewPage;