import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";

import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { WorkspaceProvider } from "./context/WorkspaceContext";
import { ToastProvider } from "./context/ToastContext";

import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import CreationLayout from "./layouts/CreationLayout";
import PPTCreationLayout from "./layouts/PPTCreationLayout";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

import DashboardPage from "./pages/DashboardPage";
import ProjectsPage from "./pages/ProjectsPage";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import HistoryPage from "./pages/HistoryPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";

import CreateProjectPage from "./pages/CreateProjectPage";
import AvatarSelectionPage from "./pages/AvatarSelectionPage";
import GenerateVideoPage from "./pages/GenerateVideoPage";
import PreviewPage from "./pages/PreviewPage";

import CreatePPTPage from "./pages/CreatePPTPage";
import GeneratePPTPage from "./pages/GeneratePPTPage";

import NotFoundPage from "./pages/NotFoundPage";

import PageEffects from "./components/common/PageEffects";
import ProtectedRoute from "./components/common/ProtectedRoute";

import { ROUTES } from "./utils/constants";

function App() {
  useEffect(() => {
    fetch("http://localhost:5000/api/test")
      .then((res) => res.json())
      .then((data) => {
        console.log("✅ Backend connected:", data);
      })
      .catch((error) => {
        console.error(
          "❌ Backend connection failed:",
          error
        );
      });
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <WorkspaceProvider>
          <ToastProvider>
              <PageEffects />

              <Routes>

                {/* =========================
                    PUBLIC MARKETING SITE
                ========================== */}
                <Route element={<MainLayout />}>
                  <Route
                    path={ROUTES.HOME}
                    element={<LandingPage />}
                  />
                </Route>


                {/* =========================
                    PUBLIC AUTHENTICATION
                ========================== */}
                <Route element={<AuthLayout />}>
                  <Route
                    path={ROUTES.LOGIN}
                    element={<LoginPage />}
                  />

                  <Route
                    path={ROUTES.SIGNUP}
                    element={<SignupPage />}
                  />

                  <Route
                    path={ROUTES.FORGOT_PASSWORD}
                    element={<ForgotPasswordPage />}
                  />

                  <Route
                    path={ROUTES.RESET_PASSWORD}
                    element={<ResetPasswordPage />}
                  />
                </Route>


                {/* =========================
                    PROTECTED WORKSPACE
                ========================== */}
                <Route element={<ProtectedRoute />}>
                  <Route element={<DashboardLayout />}>

                    {/* Dashboard */}
                    <Route
                      path={ROUTES.DASHBOARD}
                      element={<DashboardPage />}
                      handle={{ title: "Dashboard" }}
                    />

                    {/* Projects */}
                    <Route
                      path={ROUTES.PROJECTS}
                      element={<ProjectsPage />}
                      handle={{ title: "Projects" }}
                    />

                    <Route
                      path={ROUTES.PROJECT_DETAIL}
                      element={<ProjectDetailPage />}
                    />

                    {/* History */}
                    <Route
                      path={ROUTES.HISTORY}
                      element={<HistoryPage />}
                      handle={{ title: "History" }}
                    />

                    {/* Profile */}
                    <Route
                      path={ROUTES.PROFILE}
                      element={<ProfilePage />}
                      handle={{ title: "Profile" }}
                    />

                    {/* Settings */}
                    <Route
                      path={ROUTES.SETTINGS}
                      element={<SettingsPage />}
                      handle={{ title: "Settings" }}
                    />

                    {/* Admin */}
                    <Route
                      path={ROUTES.ADMIN}
                      element={<AdminDashboardPage />}
                      handle={{ title: "Admin" }}
                    />


                    {/* =========================
                        VIDEO CREATION WORKFLOW
                    ========================== */}
                    <Route element={<CreationLayout />}>

                      <Route
                        path={ROUTES.CREATE_PROJECT}
                        element={<CreateProjectPage />}
                      />

                      <Route
                        path={ROUTES.AVATAR}
                        element={<AvatarSelectionPage />}
                      />

                      <Route
                        path={ROUTES.GENERATE}
                        element={<GenerateVideoPage />}
                      />

                      <Route
                        path={ROUTES.PREVIEW}
                        element={<PreviewPage />}
                      />

                    </Route>


                  
                    <Route element={<PPTCreationLayout />}>

                      <Route
                        path={ROUTES.CREATE_PPT}
                        element={<CreatePPTPage />}
                      />


                      <Route
                        path={ROUTES.GENERATE_PPT}
                        element={<GeneratePPTPage />}
                      />

                    </Route>

                  </Route>
                </Route>


                {/* =========================
                    404
                ========================== */}
                <Route
                  path="*"
                  element={<NotFoundPage />}
                />

              </Routes>

          </ToastProvider>
        </WorkspaceProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;