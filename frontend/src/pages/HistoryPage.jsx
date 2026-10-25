import { useMemo, useState } from "react";
import { Search, Trash2, ArrowUpDown } from "lucide-react";
import Card from "../components/common/Card";
import { useWorkspace } from "../hooks/useWorkspace";
import { useToast } from "../context/ToastContext";

const actionLabels = {
  PROJECT_CREATED: "Project created",
  PROJECT_UPDATED: "Project updated",
  PROJECT_DELETED: "Project deleted",
  SCRIPT_GENERATED: "Script generated",
  SCRIPT_UPDATED: "Script updated",
  VIDEO_GENERATED: "Video generated",
  VIDEO_COMPLETED: "Video completed",
  PPT_GENERATED: "PPT generated",
};

const HistoryPage = () => {
  const [query, setQuery] = useState("");
  const [sortDesc, setSortDesc] = useState(true);
  const { history, deleteHistoryItem } = useWorkspace();
  const { showToast } = useToast();

  const rows = useMemo(() => {
    const filtered = history.filter((r) =>
      (r.description || "").toLowerCase().includes(query.toLowerCase()) ||
      (actionLabels[r.action] || r.action || "").toLowerCase().includes(query.toLowerCase())
    );
    return [...filtered].sort((a, b) =>
      sortDesc ? new Date(b.createdAt) - new Date(a.createdAt) : new Date(a.createdAt) - new Date(b.createdAt)
    );
  }, [history, query, sortDesc]);

  const handleDelete = async (row) => {
    if (!window.confirm("Delete this history entry?")) return;
    try {
      await deleteHistoryItem(row._id || row.id);
      showToast("History entry deleted");
    } catch {
      showToast("Failed to delete entry", "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="font-display text-2xl font-semibold text-body">Activity history</h2>
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-faint" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search history..."
            className="w-full rounded-xl border border-app bg-panel-2 pl-9 pr-4 py-2.5 text-sm text-body placeholder:text-faint outline-none focus:ring-2 focus:ring-violet-500/60"
          />
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-app text-left">
                <th className="px-5 py-3.5 font-medium text-subtle">Action</th>
                <th className="px-5 py-3.5 font-medium text-subtle">Entity type</th>
                <th className="px-5 py-3.5 font-medium text-subtle">Description</th>
                <th className="px-5 py-3.5 font-medium text-subtle">
                  <button onClick={() => setSortDesc((s) => !s)} className="inline-flex items-center gap-1 hover:text-body">
                    Date <ArrowUpDown size={12} />
                  </button>
                </th>
                <th className="px-5 py-3.5 font-medium text-subtle text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app">
              {rows.length ? rows.map((row) => (
                <tr key={row._id || row.id} className="hover:bg-panel-2/60 transition-colors">
                  <td className="px-5 py-4 font-medium text-body whitespace-nowrap">{actionLabels[row.action] || row.action}</td>
                  <td className="px-5 py-4 text-subtle">{row.entityType}</td>
                  <td className="px-5 py-4 text-subtle">{row.description || "-"}</td>
                  <td className="px-5 py-4 text-subtle font-mono text-xs">{new Date(row.createdAt).toLocaleString()}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => handleDelete(row)} className="h-8 w-8 flex items-center justify-center rounded-lg text-faint hover:text-rose-400 hover:bg-panel-2" aria-label="Delete">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-subtle">No history yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default HistoryPage;
