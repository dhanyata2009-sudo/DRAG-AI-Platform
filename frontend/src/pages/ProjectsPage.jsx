import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Presentation, Search, Sparkles, SlidersHorizontal, Video } from "lucide-react";
import ProjectCard from "../components/dashboard/ProjectCard";
import Button from "../components/common/Button";
import Card from "../components/common/Card";
import { ROUTES } from "../utils/constants";
import { useWorkspace } from "../hooks/useWorkspace";
import { useToast } from "../context/ToastContext";

const filters = ["All", "Draft", "In progress", "Rendered"];
const statusMap = { "Draft": "draft", "In progress": "active", "Rendered": "completed" };

const pptStatusStyles = {
  completed: "bg-emerald-500/15 text-emerald-400",
  active: "bg-amber-500/15 text-amber-400",
  draft: "bg-slate-500/15 text-subtle",
  archived: "bg-slate-500/15 text-subtle",
};
const pptStatusLabels = {
  completed: "Rendered",
  active: "In progress",
  draft: "Draft",
  archived: "Archived",
};

const ProjectsPage = () => {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [projectType, setProjectType] = useState("video");
  const { projects, presentations, duplicateProject, deleteProject } = useWorkspace();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const filtered = projects.filter((p) => {
    const name = p.projectName || p.name || "";
    const brand = p.brandName || p.brand || "";
    const matchesQuery = name.toLowerCase().includes(query.toLowerCase()) || brand.toLowerCase().includes(query.toLowerCase());
    const matchesFilter = filter === "All" || p.status === statusMap[filter];
    return matchesQuery && matchesFilter;
  });

  const filteredPresentations = presentations.filter((p) => {
    const title = p.title || "";
    const topic = p.topic || "";
    const matchesQuery = title.toLowerCase().includes(query.toLowerCase()) || topic.toLowerCase().includes(query.toLowerCase());
    const matchesFilter = filter === "All" || p.status === statusMap[filter];
    return matchesQuery && matchesFilter;
  });

  const continuePresentation = (p) => {
    const draft = {
      presentationId: p._id || p.id,
      title: p.title || "",
      topic: p.topic || "",
      slideCount: String(p.slideCount || "6"),
      targetAudience: p.targetAudience || "",
    };
    sessionStorage.setItem("drag_ai_ppt_draft_v1", JSON.stringify(draft));
    navigate(ROUTES.GENERATE_PPT);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="font-display text-2xl font-semibold text-body">Projects</h2>
        <Button as={Link} to={projectType === "video" ? ROUTES.CREATE_PROJECT : ROUTES.CREATE_PPT} icon={Sparkles}>
          {projectType === "video" ? "New video" : "New presentation"}
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2" role="tablist" aria-label="Project generation type">
        <button onClick={() => setProjectType("video")} role="tab" aria-selected={projectType === "video"} className="text-left">
          <Card className={`h-full p-5 transition-all ${projectType === "video" ? "ring-2 ring-violet-500" : "hover:bg-panel-2"}`}>
            <Video size={21} className="text-violet-400" />
            <h3 className="mt-3 font-display font-semibold text-body">Video Generation</h3>
            <p className="mt-1 text-sm text-subtle">Create and manage AI-generated ad videos.</p>
          </Card>
        </button>
        <button onClick={() => setProjectType("ppt")} role="tab" aria-selected={projectType === "ppt"} className="text-left">
          <Card className={`h-full p-5 transition-all ${projectType === "ppt" ? "ring-2 ring-violet-500" : "hover:bg-panel-2"}`}>
            <Presentation size={21} className="text-violet-400" />
            <h3 className="mt-3 font-display font-semibold text-body">PPT Generation</h3>
            <p className="mt-1 text-sm text-subtle">Plan presentation content and generate it with AI.</p>
          </Card>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-faint" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={projectType === "video" ? "Search projects..." : "Search presentations..."}
            className="w-full rounded-xl border border-app bg-panel-2 pl-10 pr-4 py-2.5 text-sm text-body placeholder:text-faint outline-none focus:ring-2 focus:ring-violet-500/60"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <SlidersHorizontal size={16} className="text-faint shrink-0" />
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`shrink-0 text-xs font-medium px-3.5 py-2 rounded-lg transition-colors ${
                filter === f ? "bg-gradient-brand text-white" : "glass text-subtle hover:text-body"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {projectType === "video" ? (
        filtered.length ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filtered.map((p) => (
              <ProjectCard
                key={p._id || p.id}
                project={p}
                onDuplicate={() => { duplicateProject(p._id || p.id); showToast("Project duplicated"); }}
                onDelete={() => { if (window.confirm(`Delete "${p.projectName || p.name}"?`)) { deleteProject(p._id || p.id); showToast("Project deleted"); } }}
              />
            ))}
          </div>
        ) : (
          <Card className="p-10 text-center text-subtle text-sm">No projects found.</Card>
        )
      ) : filteredPresentations.length ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredPresentations.map((p) => {
            const id = p._id || p.id;
            const status = p.status || "draft";
            const downloadHref = p.fileName
              ? `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"}/presentations/download/${p.fileName}`
              : "";
            return (
              <Card key={id} className="p-5 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-display font-semibold text-body truncate">{p.title || "Untitled presentation"}</h3>
                    <p className="text-xs text-subtle mt-0.5 truncate">{p.topic}</p>
                  </div>
                  <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full shrink-0 ${pptStatusStyles[status] || pptStatusStyles.draft}`}>
                    {pptStatusLabels[status] || status}
                  </span>
                </div>
                <p className="text-xs text-faint">{p.slideCount} slides &middot; {p.targetAudience}</p>
                <div className="flex items-center gap-2 mt-1">
                  {status === "completed" && p.fileName ? (
                    <a href={downloadHref} download className="text-xs font-medium text-violet-400 hover:text-violet-300">
                      Download
                    </a>
                  ) : (
                    <button onClick={() => continuePresentation(p)} className="text-xs font-medium text-violet-400 hover:text-violet-300">
                      Continue
                    </button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-10 text-center text-subtle text-sm">No presentations found.</Card>
      )}
    </div>
  );
};

export default ProjectsPage;



