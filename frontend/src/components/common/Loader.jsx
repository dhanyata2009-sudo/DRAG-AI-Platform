import { motion } from "framer-motion";

const Loader = ({ size = 40, label }) => (
  <div className="flex flex-col items-center justify-center gap-3">
    <motion.div
      style={{ width: size, height: size }}
      className="rounded-full border-[3px] border-app border-t-transparent"
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
    >
      <div
        className="w-full h-full rounded-full"
        style={{
          background: "conic-gradient(from 0deg, transparent, var(--color-magenta), var(--color-violet), var(--color-blue), var(--color-cyan), transparent)",
          WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))",
          mask: "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))",
        }}
      />
    </motion.div>
    {label && <p className="text-sm text-subtle font-mono">{label}</p>}
  </div>
);

export default Loader;
