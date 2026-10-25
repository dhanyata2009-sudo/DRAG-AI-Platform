import { Link } from "react-router-dom";
import { Home } from "lucide-react";
import Button from "../components/common/Button";
import Logo from "../components/common/Logo";
import GlowBackground from "../components/common/GlowBackground";
import { ROUTES } from "../utils/constants";

const NotFoundPage = () => (
  <div className="relative min-h-screen bg-app text-body flex flex-col items-center justify-center px-6 text-center overflow-hidden">
    <GlowBackground />
    <div className="relative z-10">
      <div className="mb-8">
        <Logo />
      </div>
      <p className="font-display text-8xl font-semibold text-gradient">404</p>
      <h1 className="font-display text-2xl font-semibold text-body mt-4">This page drifted off-script</h1>
      <p className="text-subtle text-sm mt-2 max-w-sm mx-auto">
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <Button as={Link} to={ROUTES.HOME} icon={Home} className="mt-8">
        Back to home
      </Button>
    </div>
  </div>
);

export default NotFoundPage;
