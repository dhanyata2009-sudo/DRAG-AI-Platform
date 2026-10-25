import { Outlet, Link } from "react-router-dom";
import { motion } from "framer-motion";
import Logo from "../components/common/Logo";
import ThemeToggle from "../components/common/ThemeToggle";
import GlowBackground from "../components/common/GlowBackground";
import { ROUTES } from "../utils/constants";

const AuthLayout = () => (
  <div className="relative min-h-screen bg-app text-body grid lg:grid-cols-2 overflow-hidden">
    {/* Branding panel */}
    <div className="relative hidden lg:flex flex-col justify-between p-12 bg-gradient-brand overflow-hidden">
      <Link to={ROUTES.HOME} className="relative z-10">
        <span className="inline-flex items-center gap-2.5">
          <img src="/favicon.jpeg" alt="DRAG.ai" className="h-10 w-10 rounded-xl" />
          <span className="font-display font-semibold text-lg text-white">DRAG.ai</span>
        </span>
      </Link>

      <div className="relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-display text-4xl font-semibold text-white leading-tight max-w-md"
        >
          One workspace for videos and presentations.
        </motion.h2>
        <p className="text-white/75 mt-4 max-w-sm text-sm leading-relaxed">
          Plan video generation and PPT creation from a frontend prepared for backend integration.
        </p>
      </div>

      <p className="relative z-10 text-white/60 text-xs font-mono">© {new Date().getFullYear()} DRAG.ai</p>

      {/* decorative circuit lines */}
      <svg className="absolute inset-0 w-full h-full opacity-25" viewBox="0 0 500 700" fill="none">
        {[100, 200, 300, 400, 500, 600].map((y, i) => (
          <line key={i} x1="0" y1={y} x2={120 + i * 30} y2={y} stroke="white" strokeWidth="1" />
        ))}
      </svg>
    </div>

    {/* Form panel */}
    <div className="relative flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-12">
      <GlowBackground variant="auth" />
      <div className="absolute top-6 right-6 z-10">
        <ThemeToggle />
      </div>
      <div className="lg:hidden mb-10">
        <Logo />
      </div>
      <div className="relative z-10 w-full max-w-sm mx-auto">
        <Outlet />
      </div>
    </div>
  </div>
);

export default AuthLayout;
