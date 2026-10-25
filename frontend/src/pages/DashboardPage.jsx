import { Link } from "react-router-dom";
import { ArrowRight, FolderKanban, Presentation, Sparkles } from "lucide-react";
import StatCard from "../components/dashboard/StatCard";
import ProjectCard from "../components/dashboard/ProjectCard";
import Button from "../components/common/Button";
import Card from "../components/common/Card";
import { useAuth } from "../hooks/useAuth";
import { useWorkspace } from "../hooks/useWorkspace";
import { useToast } from "../context/ToastContext";
import { ROUTES } from "../utils/constants";

const DashboardPage = () => {
  const { user } = useAuth();
  const { projects, presentations, history, duplicateProject, deleteProject } = useWorkspace();
  const { showToast } = useToast();
  const firstName = user?.name?.split(" ")[0] || "there";

  const stats = [
    { label: "Videos generated", value: String(history.length), delta: history.length ? "From your workspace" : "No data yet" },
    { label: "Active projects", value: String(projects.filter((project) => project.status !== "completed").length), delta: projects.length ? "From your workspace" : "No data yet" },
    { label: "Avg. render time", value: user?.averageRenderTime || "-", delta: "Awaiting backend data" },
    { label: "PPTs generated", value: String(presentations.length), delta: presentations.length ? "From your workspace" : "No data yet" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold text-body">Welcome back, {firstName}</h2>
          <p className="text-subtle text-sm mt-1">Here's what's happening with your ad videos.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button as={Link} to={ROUTES.CREATE_PROJECT} icon={Sparkles}>New video</Button>
          <Button as={Link} to={ROUTES.CREATE_PPT} variant="secondary" icon={Presentation}>New PPT</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-semibold text-body">Recent projects</h3>
          <Link to={ROUTES.PROJECTS} className="text-sm text-violet-400 hover:text-violet-300 font-medium inline-flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        {projects.length ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {projects.slice(0, 4).map((p) => (
              <ProjectCard
                key={p._id || p.id}
                project={p}
                onDuplicate={() => { duplicateProject(p._id || p.id); showToast("Project duplicated"); }}
                onDelete={() => { if (window.confirm(`Delete "${p.projectName || p.name}"?`)) { deleteProject(p._id || p.id); showToast("Project deleted"); } }}
              />
            ))}
          </div>
        ) : (
          <Card className="p-10 text-center text-subtle text-sm">
            <FolderKanban size={28} className="mx-auto mb-3 text-faint" />
            No projects yet. Start your first one above.
          </Card>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
