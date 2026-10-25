import { useContext } from "react";
import { ProjectCreationContext } from "../context/ProjectCreationContext";

export const useProjectCreation = () => {
  const context = useContext(ProjectCreationContext);

  if (!context) {
    throw new Error("useProjectCreation must be used inside ProjectCreationProvider");
  }

  return context;
};

export { ProjectCreationProvider } from "../context/ProjectCreationContext";
