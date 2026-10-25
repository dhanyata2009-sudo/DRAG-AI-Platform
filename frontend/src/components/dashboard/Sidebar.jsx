import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, FolderKanban, History, User, Settings, X, Sparkles, LogOut } from "lucide-react";
import Logo from "../common/Logo";
import Button from "../common/Button";
import { ROUTES } from "../../utils/constants";
import { useAuth } from "../../hooks/useAuth";

const icons = { LayoutDashboard, FolderKanban, History, User, Settings };

const links = [
  { label: "Dashboard", to: ROUTES.DASHBOARD, icon: "LayoutDashboard" },
  { label: "Projects", to: ROUTES.PROJECTS, icon: "FolderKanban" },
  { label: "History", to: ROUTES.HISTORY, icon: "History" },
  { label: "Profile", to: ROUTES.PROFILE, icon: "User" },
  { label: "Settings", to: ROUTES.SETTINGS, icon: "Settings" },
];

const Sidebar = ({ onClose }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    onClose?.();
    navigate(ROUTES.LOGIN, { replace: true });
  };

  return (
    <div className="flex flex-col h-full glass border-r border-app w-72 px-5 py-6">
      <div className="flex items-center justify-between mb-8 px-1">
        <Logo />
        {onClose && (
          <button onClick={onClose} className="lg:hidden text-faint hover:text-body" aria-label="Close menu">
            <X size={20} />
          </button>
        )}
      </div>

      <Button as={NavLink} to={ROUTES.PROJECTS} icon={Sparkles} fullWidth className="mb-6">
        New project
      </Button>

      <nav className="flex-1 space-y-1">
        {links.map((link) => {
          const Icon = icons[link.icon];
          return (
            <NavLink
              key={link.label}
              to={link.to}
              end={link.to === ROUTES.DASHBOARD}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive ? "bg-panel-2 text-body" : "text-subtle hover:bg-panel-2 hover:text-body"
                }`
              }
            >
              <Icon size={18} />
              {link.label}
            </NavLink>
          );
        })}
      </nav>

      <button onClick={handleLogout} className="mt-5 flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-subtle transition-colors hover:bg-panel-2 hover:text-body">
        <LogOut size={18} />
        Log out
      </button>
    </div>
  );
};

export default Sidebar;
