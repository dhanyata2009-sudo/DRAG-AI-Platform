export const APP_NAME = "DRAG.ai";

// Frontend-only credentials for the college demo. These are not secure and
// must be replaced by backend authentication before any real deployment.
export const DEMO_CREDENTIALS = Object.freeze({
  loginId: "admin@123",
  password: "admin_pass",
});

export const ROUTES = {
  HOME: "/",
  SIGNUP: "/signup",
  LOGIN: "/login",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password/:token",
  DASHBOARD: "/dashboard",
  PROJECTS: "/projects",
  PROJECT_DETAIL: "/projects/:projectId",
  CREATE_PROJECT: "/projects/new",
  AVATAR: "/projects/new/avatar",
  GENERATE: "/projects/new/generate",
  PREVIEW: "/projects/new/preview",
  CREATE_PPT: "/projects/ppt/new",
  PPT_CONTENT: "/projects/ppt/new/content",
  GENERATE_PPT: "/projects/ppt/new/generate",
  HISTORY: "/history",
  PROFILE: "/profile",
  SETTINGS: "/settings",
  ADMIN: "/admin",
};

export const projectDetailPath = (projectId) => `/projects/${projectId}`;

export const getRouteTitle = (pathname) => {
  const titles = {
    [ROUTES.HOME]: "Video & PPT Generation",
    [ROUTES.SIGNUP]: "Create account",
    [ROUTES.LOGIN]: "Log in",
    [ROUTES.FORGOT_PASSWORD]: "Reset password",
    [ROUTES.RESET_PASSWORD]: "Choose a new password",
    [ROUTES.DASHBOARD]: "Dashboard",
    [ROUTES.PROJECTS]: "Projects",
    [ROUTES.CREATE_PROJECT]: "New project",
    [ROUTES.AVATAR]: "Choose avatar",
    [ROUTES.GENERATE]: "Generate video",
    [ROUTES.PREVIEW]: "Video preview",
    [ROUTES.CREATE_PPT]: "New presentation",
    [ROUTES.PPT_CONTENT]: "Presentation content",
    [ROUTES.GENERATE_PPT]: "Generate PPT",
    [ROUTES.HISTORY]: "History",
    [ROUTES.PROFILE]: "Profile",
    [ROUTES.SETTINGS]: "Settings",
    [ROUTES.ADMIN]: "Admin",
  };
  return titles[pathname] || (/^\/projects\/[^/]+$/.test(pathname) ? "Project details" : "Page not found");
};

export const SIDEBAR_LINKS = [
  { label: "Dashboard", to: ROUTES.DASHBOARD, icon: "LayoutDashboard" },
  { label: "Projects", to: ROUTES.PROJECTS, icon: "FolderKanban" },
  { label: "History", to: ROUTES.HISTORY, icon: "History" },
  { label: "Profile", to: ROUTES.PROFILE, icon: "User" },
  { label: "Settings", to: ROUTES.SETTINGS, icon: "Settings" },
];
