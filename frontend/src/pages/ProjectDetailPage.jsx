import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Copy, Download, Play, Sparkles, Trash2 } from "lucide-react";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import { useWorkspace } from "../hooks/useWorkspace";
import { useToast } from "../context/ToastContext";
import { ROUTES, projectDetailPath } from "../utils/constants";

const ProjectDetailPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { projects, duplicateProject, deleteProject } = useWorkspace();
  const { showToast } = useToast();
  const project = projects.find(
    (item) => String(item._id || item.id) === String(projectId)
);
  if (!project) {
    return (
      <Card className="mx-auto max-w-lg p-10 text-center">
        <h2 className="font-display text-xl font-semibold text-body">Project not found</h2>
        <p className="mt-2 text-sm text-subtle">It may have been deleted or moved.</p>
        <Button as={Link} to={ROUTES.PROJECTS} className="mt-6" icon={ArrowLeft}>Back to projects</Button>
      </Card>
    );
  }

  const duplicate = () => {
    const projectDbId = project._id || project.id;

    const copy = duplicateProject(projectDbId);
    if (copy) {
      showToast("Project duplicated");
      navigate(projectDetailPath(copy.id));
    }
  };

  const remove = () => {
    if (!window.confirm(`Delete “${project.projectName}”? This cannot be undone.`)) return;
    deleteProject(projectDbId);
    showToast("Project deleted", "info");
    navigate(ROUTES.PROJECTS);
  };

  const downloadBrief = () => {
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${project.projectName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-project.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    showToast("Project file downloaded");
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link to={ROUTES.PROJECTS} className="inline-flex items-center gap-1.5 text-sm font-medium text-subtle hover:text-body">
        <ArrowLeft size={15} /> Back to projects
      </Link>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-full bg-slate-500/15 px-2.5 py-1 text-[11px] font-medium text-subtle">
  {project.status === "draft"
    ? "Draft"
    : project.status === "active"
    ? "In progress"
    : project.status === "completed"
    ? "Rendered"
    : "Archived"}
</span>            
<span className="text-xs font-mono text-faint">Updated {project.updatedAt}</span>
          </div>
          <h2 className="font-display text-3xl font-semibold text-body">
  {project.projectName || "Untitled Project"}
</h2>
          <p className="mt-1 text-subtle">
  {project.brandName || "No brand"} · {project.platform || "No platform"} · {project.adStyle || "No style"}
</p>      
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" icon={Copy} onClick={duplicate}>Duplicate</Button>
          <Button variant="secondary" size="sm" icon={Download} onClick={downloadBrief}>Export</Button>
          <Button variant="danger" size="sm" icon={Trash2} onClick={remove}>Delete</Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="overflow-hidden p-3">
          <div className="relative aspect-video overflow-hidden rounded-xl bg-panel-2">
            <img src={project.thumbnail} alt={`${project.projectName} thumbnail`} className="h-full w-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/25">
              <button className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 text-violet-700 shadow-xl" aria-label="Play video preview">
                <Play size={25} className="ml-1" />
              </button>
            </div>
          </div>
        </Card>
        <Card className="p-6 sm:p-7">
          <h3 className="font-display text-lg font-semibold text-body">Creative brief</h3>
          <dl className="mt-5 space-y-4 text-sm">
            {[
              ["Product", project.brief?.productName || project.projectName],
              ["Audience", project.brief?.targetAudience || "General audience"],
              ["Tone", project.brief?.tone || "Friendly"],
              ["Language", project.brief?.language || "English"],
              ["Duration", project.brief?.duration || "30s"],
              ["Avatar", project.brief?.avatar?.name || "AI creator"],
              ["Voice", project.brief?.voice?.name || "Natural voice"],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between gap-5 border-b border-app pb-3 last:border-0">
                <dt className="text-subtle">{label}</dt><dd className="text-right font-medium text-body">{value}</dd>
              </div>
            ))}
          </dl>
          <Button as={Link} to={ROUTES.CREATE_PROJECT} fullWidth className="mt-6" icon={Sparkles}>Create a new variation</Button>
        </Card>
      </div>
    </div>
  );
};

export default ProjectDetailPage;
