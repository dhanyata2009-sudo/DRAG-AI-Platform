import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

export const ProjectCreationContext = createContext(null);

const initialData = {
  projectId: null,
  projectName: "",
  productName: "",
  brandName: "",
  productDescription: "",
  productImageUrl: null,
  targetAudience: "",
  marketingGoal: "",
  platform: "Instagram",
  adStyle: "UGC",
  tone: "Friendly",
  language: "English",
  videoDuration: "15s",
  callToAction: "",
  avatar: null,
  voice: null,
  videoId: null,
  video: null,
  videoUrl: null,
  downloadUrl: null,
  generatedScript: "",
  generationStatus: "idle",
};

export const STORAGE_KEY = "drag_ai_project_draft_v3";

export const ProjectCreationProvider = ({ children }) => {
  const [data, setData] = useState(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      return saved
        ? { ...initialData, ...JSON.parse(saved) }
        : { ...initialData };
    } catch {
      return { ...initialData };
    }
  });

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("Could not save project draft:", error);
    }
  }, [data]);

  const updateData = useCallback((patch) => {
    setData((previous) => ({ ...previous, ...patch }));
  }, []);

  const clearData = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY);
    setData({ ...initialData });
  }, []);

  const value = useMemo(
    () => ({ data, updateData, clearData }),
    [data, updateData, clearData]
  );

  return (
    <ProjectCreationContext.Provider value={value}>
      {children}
    </ProjectCreationContext.Provider>
  );
};