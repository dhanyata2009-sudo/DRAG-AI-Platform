import { Navigate, Outlet, useLocation } from "react-router-dom";
import { ProjectCreationProvider } from "../context/ProjectCreationContext";
import StepIndicator from "../components/project/StepIndicator";
import { ROUTES } from "../utils/constants";
import { useProjectCreation } from "../hooks/useProjectCreation";

const steps = ["Details", "Avatar", "Generate", "Preview"];

const stepMap = [
  { path: ROUTES.CREATE_PROJECT, label: "Details" },
  { path: ROUTES.AVATAR, label: "Avatar" },
  { path: ROUTES.GENERATE, label: "Generate" },
  { path: ROUTES.PREVIEW, label: "Preview" },
];

const CreationFlow = () => {
  const location = useLocation();
  const { data } = useProjectCreation();
  const current = stepMap.find((item) => item.path === location.pathname);
  const currentIndex = current ? steps.indexOf(current.label) + 1 : 1;

  const detailsComplete = [
    data.projectName,
    data.productName,
    data.brandName,
    data.productDescription,
    data.productImageUrl,
  ].every((value) => typeof value === "string" ? value.trim() : Boolean(value));

  const hasVideo =
  data.generationStatus === "completed" &&
  Boolean(data.videoUrl || data.video?.videoUrl || data.video?.url);

const prerequisites = {
  [ROUTES.AVATAR]: detailsComplete
    ? null
    : ROUTES.CREATE_PROJECT,

  [ROUTES.GENERATE]: data.avatar
    ? null
    : detailsComplete
      ? ROUTES.AVATAR
      : ROUTES.CREATE_PROJECT,

  [ROUTES.PREVIEW]: hasVideo
    ? null
    : data.avatar
      ? ROUTES.GENERATE
      : ROUTES.CREATE_PROJECT,
};
  const redirectTo = prerequisites[location.pathname];
  if (redirectTo) return <Navigate to={redirectTo} replace />;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <StepIndicator steps={steps} currentStep={currentIndex} />
      <Outlet />
    </div>
  );
};

const CreationLayout = () => (
  <ProjectCreationProvider>
    <CreationFlow />
  </ProjectCreationProvider>
);

export default CreationLayout;
