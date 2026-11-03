
import { createContext, useEffect, useState } from "react";

export const PPTCreationContext = createContext(null);

const initialData = {
  title: "",
  topic: "",
  slideCount: "6",
  targetAudience: "",
};

const STORAGE_KEY = "drag_ai_ppt_draft_v1";

export const PPTCreationProvider = ({ children }) => {
  const [data, setData] = useState(() => {
    if (typeof window === "undefined") return initialData;

    try {
      return {
        ...initialData,
        ...JSON.parse(sessionStorage.getItem(STORAGE_KEY)),
      };
    } catch {
      return initialData;
    }
  });

  // Shared state for the optional PPT source file
  const [selectedSourceFile, setSelectedSourceFile] = useState(null);

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const updateData = (patch) => {
    setData((current) => ({ ...current, ...patch }));
  };

  const resetData = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    setData({ ...initialData });
    setSelectedSourceFile(null);
  };

  return (
    <PPTCreationContext.Provider
      value={{
        data,
        updateData,
        resetData,
        selectedSourceFile,
        setSelectedSourceFile,
      }}
    >
      {children}
    </PPTCreationContext.Provider>
  );
};
