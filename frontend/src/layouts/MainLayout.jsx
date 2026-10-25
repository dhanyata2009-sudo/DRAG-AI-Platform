import { Outlet } from "react-router-dom";
import Navbar from "../components/landing/Navbar";
import Footer from "../components/landing/Footer";
import GlowBackground from "../components/common/GlowBackground";

const MainLayout = () => (
  <div className="relative min-h-screen bg-app text-body overflow-x-hidden">
    <GlowBackground />
    <div className="relative z-10">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  </div>
);

export default MainLayout;
