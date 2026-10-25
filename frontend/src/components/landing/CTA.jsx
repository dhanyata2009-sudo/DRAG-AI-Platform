import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Button from "../common/Button";
import { ROUTES } from "../../utils/constants";

const CTA = () => (
  <section className="relative py-20">
    <div className="max-w-5xl mx-auto px-5 sm:px-8 lg:px-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-brand px-8 py-16 sm:px-16 text-center"
      >
        <h2 className="font-display text-3xl sm:text-4xl font-semibold text-white max-w-xl mx-auto leading-tight">
          Create videos and presentations in one workspace.
        </h2>
        <p className="text-white/80 mt-4 max-w-md mx-auto">
          Built as a free college project and prepared for the backend team to connect.
        </p>
        <div className="mt-8">
          <Button
            as={Link}
            to={ROUTES.LOGIN}
            size="lg"
            icon={ArrowRight}
            iconPosition="right"
            className="!bg-[#fffaf0] !text-violet-700 hover:!brightness-95"
          >
            Log in to workspace
          </Button>
        </div>
      </motion.div>
    </div>
  </section>
);

export default CTA;
