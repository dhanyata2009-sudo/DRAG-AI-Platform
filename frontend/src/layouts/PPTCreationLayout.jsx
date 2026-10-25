import { Navigate, Outlet, useLocation } from "react-router-dom";

import StepIndicator from "../components/project/StepIndicator";
import { PPTCreationProvider } from "../context/PPTCreationContext";
import { usePPTCreation } from "../hooks/usePPTCreation";
import { ROUTES } from "../utils/constants";

const steps = ["Details", "Generate"];

const stepPaths = [
  ROUTES.CREATE_PPT,
  ROUTES.GENERATE_PPT,
];

const PPTCreationFlow = () => {
  const location = useLocation();
  const { data } = usePPTCreation();

  const currentIndex = Math.max(
    0,
    stepPaths.indexOf(location.pathname)
  ) + 1;

  const detailsComplete = [
    data.title,
    data.topic,
    data.targetAudience,
  ].every((value) => value?.trim());

  if (
    location.pathname !== ROUTES.CREATE_PPT &&
    !detailsComplete
  ) {
    return (
      <Navigate
        to={ROUTES.CREATE_PPT}
        replace
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <StepIndicator
        steps={steps}
        currentStep={currentIndex}
      />

      <Outlet />
    </div>
  );
};

const PPTCreationLayout = () => {
  return (
    <PPTCreationProvider>
      <PPTCreationFlow />
    </PPTCreationProvider>
  );
};

export default PPTCreationLayout;