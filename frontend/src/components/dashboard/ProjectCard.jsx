import { Link, useNavigate } from "react-router-dom";
import { MoreVertical, Copy, Trash2, Download, ArrowRight } from "lucide-react";
import { useState } from "react";
import Card from "../common/Card";
import { projectDetailPath } from "../../utils/constants";
import { resumeProject } from "../../utils/resumeProject";

const statusStyles = {
  completed: "bg-emerald-500/15 text-emerald-400",
  active: "bg-amber-500/15 text-amber-400",
  draft: "bg-slate-500/15 text-subtle",
  archived: "bg-slate-500/15 text-subtle",
};

const statusLabels = {
  completed: "Rendered",
  active: "In progress",
  draft: "Draft",
  archived: "Archived",
};

const ProjectCard = ({ project, onDuplicate, onDelete, onDownload }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const id = project._id || project.id;
  const name = project.projectName || project.name || "Untitled";
  const brand = project.brandName || project.brand || "";
  const status = project.status || "draft";
  const updatedAt = project.updatedAt ? new Date(project.updatedAt).toLocaleDateString() : "";
  const canContinue = status === "draft" || status === "active";

  const handleContinue = (e) => {
    e.preventDefault();
    const route = resumeProject(project);
    navigate(route);
  };

  return (
    <Card hover className="overflow-hidden">
      <Link to={projectDetailPath(id)} className="block relative aspect-video overflow-hidden bg-panel-2">
        {project.thumbnail && (
          <img src={project.thumbnail} alt={name} className="w-full h-full object-cover" />
        )}
        <span className={`absolute top-3 left-3 text-[11px] font-medium px-2.5 py-1 rounded-full ${statusStyles[status] || statusStyles.draft}`}>
          {statusLabels[status] || status}
        </span>
      </Link>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-display font-semibold text-body truncate">{name}</h3>
            <p className="text-xs text-subtle mt-0.5 truncate">{brand}</p>
          </div>
          <div className="relative shrink-0">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="h-8 w-8 flex items-center justify-center rounded-lg text-faint hover:text-body hover:bg-panel-2"
              aria-label="Project actions"
            >
              <MoreVertical size={16} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-9 z-10 w-40 glass rounded-xl p-1.5 shadow-xl">
                {[
                  { label: "Duplicate", icon: Copy, action: onDuplicate },
                  { label: "Download", icon: Download, action: onDownload },
                  { label: "Delete", icon: Trash2, danger: true, action: onDelete },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      setMenuOpen(false);
                      item.action?.(project);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      item.danger ? "text-rose-400 hover:bg-rose-500/10" : "text-subtle hover:bg-panel-2 hover:text-body"
                    }`}
                  >
                    <item.icon size={14} />
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 mt-3.5">
          {project.platform && <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-panel-2 text-subtle">{project.platform}</span>}
          {project.adStyle && <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-panel-2 text-subtle">{project.adStyle}</span>}
        </div>

        <div className="flex items-center justify-between mt-3">
          {updatedAt && <p className="text-[11px] text-faint">Updated {updatedAt}</p>}
          {canContinue && (
            <button
              onClick={handleContinue}
              className="flex items-center gap-1 text-[11px] font-medium text-violet-400 hover:text-violet-300"
            >
              Continue <ArrowRight size={12} />
            </button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ProjectCard;
