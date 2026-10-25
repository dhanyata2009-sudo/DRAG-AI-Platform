import { createContext, useCallback, useEffect, useMemo, useState } from "react";

import {
  getProjects,
  createProject as createProjectApi,
  updateProject as updateProjectApi,
  deleteProject as deleteProjectApi,
} from "../services/projectService";

import {
  getPresentations,
  createPresentation as createPresentationApi,
} from "../services/presentationService";

import {
  getHistory,
  deleteHistoryItem as deleteHistoryItemApi,
} from "../services/historyService";

import {
  getSettings,
  updateSettings as updateSettingsApi,
} from "../services/settingsService";

import {
  getNotifications,
  markNotificationRead,
  deleteNotification as deleteNotificationApi,
} from "../services/notificationService";

import { useAuth } from "../hooks/useAuth";

export const WorkspaceContext = createContext(null);

export const WorkspaceProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();

  const [projects, setProjects] = useState([]);
  const [presentations, setPresentations] = useState([]);
  const [history, setHistory] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [preferences, setPreferences] = useState({});
  const [loading, setLoading] = useState(false);

  const refreshAll = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const [projectsRes, presentationsRes, historyRes, settingsRes, notificationsRes] = await Promise.all([
        getProjects(),
        getPresentations(),
        getHistory(),
        getSettings(),
        getNotifications(),
      ]);

      setProjects(projectsRes.projects || projectsRes.data || []);
      setPresentations(presentationsRes.presentations || presentationsRes.data || []);
      setHistory(historyRes.history || historyRes.data || []);
      setPreferences(settingsRes.settings || settingsRes.data || {});
      setNotifications(notificationsRes.notifications || notificationsRes.data || []);
    } catch (err) {
      console.error("Failed to load workspace data:", err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const createProject = useCallback(async (payload) => {
    try {
      const response = await createProjectApi({ ...payload, status: "draft" });
      const project = response.project || response.data;
      if (project) setProjects((current) => [project, ...current]);
      return project;
    } catch (error) {
      console.error("Failed to create project:", error);
      throw error;
    }
  }, []);

  const updateProject = useCallback(async (id, payload) => {
    try {
      const response = await updateProjectApi(id, payload);
      const updatedProject = response.project || response.data;
      if (updatedProject) {
        setProjects((current) => current.map((project) => (project._id || project.id) === id ? updatedProject : project));
      }
      return updatedProject;
    } catch (error) {
      console.error("Failed to update project:", error);
      throw error;
    }
  }, []);

  const deleteProject = useCallback(async (id) => {
    await deleteProjectApi(id);
    setProjects((current) => current.filter((p) => p.id !== id && p._id !== id));
  }, []);

  const duplicateProject = useCallback((id) => {
    console.warn("duplicateProject: not yet connected to backend");
  }, []);

  const createPresentation = useCallback(async (payload) => {
    try {
      const response = await createPresentationApi(payload);
      const presentation = response.presentation || response.data;
      if (presentation) setPresentations((current) => [presentation, ...current]);
      return presentation;
    } catch (error) {
      console.error("Failed to create presentation:", error);
      throw error;
    }
  }, []);

  const upsertPresentation = useCallback((presentation) => {
    if (!presentation) return;
    setPresentations((current) => {
      const id = presentation._id || presentation.id;
      const exists = current.some((p) => (p._id || p.id) === id);
      return exists
        ? current.map((p) => ((p._id || p.id) === id ? presentation : p))
        : [presentation, ...current];
    });
  }, []);

  const deleteHistoryItemFn = useCallback(async (id) => {
    await deleteHistoryItemApi(id);
    setHistory((current) => current.filter((h) => h.id !== id && h._id !== id));
  }, []);

  const markAllNotificationsRead = useCallback(async () => {
    const unread = notifications.filter((n) => !n.read);
    await Promise.all(unread.map((n) => markNotificationRead(n.id || n._id)));
    setNotifications((current) => current.map((n) => ({ ...n, read: true })));
  }, [notifications]);

  const deleteNotification = useCallback(async (id) => {
    await deleteNotificationApi(id);
    setNotifications((current) => current.filter((n) => n.id !== id && n._id !== id));
  }, []);

  const updatePreferences = useCallback(async (patch) => {
    const updated = await updateSettingsApi(patch);
    setPreferences(updated.settings || updated.data || patch);
  }, []);

  const value = useMemo(() => ({
    projects,
    presentations,
    history,
    notifications,
    preferences,
    loading,
    createProject,
    updateProject,
    deleteProject,
    duplicateProject,
    createPresentation,
    upsertPresentation,
    deleteHistoryItem: deleteHistoryItemFn,
    markAllNotificationsRead,
    deleteNotification,
    updatePreferences,
    refreshAll,
  }), [
    projects, presentations, history, notifications, preferences, loading,
    createProject, updateProject, deleteProject, duplicateProject,
    createPresentation, upsertPresentation,
    deleteHistoryItemFn, markAllNotificationsRead, deleteNotification, updatePreferences, refreshAll,
  ]);

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
};
