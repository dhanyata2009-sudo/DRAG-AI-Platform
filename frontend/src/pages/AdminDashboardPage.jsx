import { FolderKanban, TrendingUp, Users, Video } from "lucide-react";
import Card from "../components/common/Card";
import StatCard from "../components/dashboard/StatCard";

const adminStats = [
  { label: "Total users", value: "—", delta: "Awaiting backend data" },
  { label: "Total projects", value: "—", delta: "Awaiting backend data" },
  { label: "Videos generated", value: "—", delta: "Awaiting backend data" },
  { label: "Monthly active", value: "—", delta: "Awaiting backend data" },
];

const analytics = [
  { icon: Users, label: "Signups this week" },
  { icon: FolderKanban, label: "Avg. projects / user" },
  { icon: Video, label: "Avg. render success" },
];

const AdminDashboardPage = () => (
  <div className="space-y-8">
    <div>
      <h2 className="font-display text-2xl font-semibold text-body">Admin dashboard</h2>
      <p className="text-subtle text-sm mt-1">Platform-wide data will appear after the backend is connected.</p>
    </div>

    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {adminStats.map((stat) => <StatCard key={stat.label} {...stat} />)}
    </div>

    <Card className="p-6 sm:p-8">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp size={18} className="text-violet-400" />
        <h3 className="font-display font-semibold text-body">Analytics snapshot</h3>
      </div>
      <div className="grid sm:grid-cols-3 gap-6">
        {analytics.map((item) => (
          <div key={item.label} className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-panel-2 flex items-center justify-center text-violet-400">
              <item.icon size={18} />
            </div>
            <div>
              <p className="font-display font-semibold text-body">—</p>
              <p className="text-xs text-subtle">{item.label}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>

    <Card className="overflow-hidden">
      <div className="px-6 py-4 border-b border-app">
        <h3 className="font-display font-semibold text-body">Recent users</h3>
      </div>
      <p className="py-14 text-center text-sm text-subtle">No user data available yet.</p>
    </Card>
  </div>
);

export default AdminDashboardPage;
