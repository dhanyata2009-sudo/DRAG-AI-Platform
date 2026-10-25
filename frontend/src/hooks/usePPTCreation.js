import { useContext } from "react";
import { PPTCreationContext } from "../context/PPTCreationContext";

export const usePPTCreation = () => {
  const context = useContext(PPTCreationContext);
  if (!context) throw new Error("usePPTCreation must be used inside PPTCreationProvider");
  return context;
};
