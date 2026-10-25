import { Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";

const ThemeToggle = ({ className = "" }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      className={`relative inline-flex h-9 w-[4.25rem] items-center rounded-full transition-all duration-500 ease-out ${
        isDark
          ? "bg-[#1c1a19] border border-[#3b3634] shadow-[0_0_15px_rgba(154,106,67,0.15)]"
          : "bg-[#f1e8db] border border-[#ddd0bd] shadow-[0_0_15px_rgba(154,106,67,0.2)]"
      } ${className}`}
    >
      {/* Background track glow */}
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{
          boxShadow: isDark
            ? "inset 0 0 12px rgba(118,82,55,0.3), 0 0 8px rgba(118,82,55,0.1)"
            : "inset 0 0 12px rgba(154,106,67,0.15), 0 0 8px rgba(154,106,67,0.08)",
        }}
        transition={{ duration: 0.5 }}
      />

      {/* Sliding thumb */}
      <motion.span
        layout
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 28,
          mass: 0.8,
        }}
        className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full shadow-lg ${
          isDark
            ? "ml-[3px] bg-gradient-to-br from-[#8b6b4a] to-[#5e432f]"
            : "ml-auto mr-[3px] bg-gradient-to-br from-[#9a6a43] to-[#765237]"
        }`}
        style={{
          boxShadow: isDark
            ? "0 2px 10px rgba(139,107,74,0.5), 0 0 20px rgba(139,107,74,0.15)"
            : "0 2px 10px rgba(154,106,67,0.5), 0 0 20px rgba(154,106,67,0.15)",
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.span
              key="moon"
              initial={{ rotate: -90, scale: 0, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: 90, scale: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <Moon size={14} strokeWidth={2.2} className="text-white" />
            </motion.span>
          ) : (
            <motion.span
              key="sun"
              initial={{ rotate: 90, scale: 0, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: -90, scale: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <Sun size={14} strokeWidth={2.2} className="text-white" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.span>

      {/* Stars (visible in dark mode) */}
      <AnimatePresence>
        {isDark && (
          <>
            {[{ top: "4px", left: "22px", size: 2, delay: 0 },
              { top: "18px", left: "18px", size: 1.5, delay: 0.1 },
              { top: "10px", left: "30px", size: 1, delay: 0.2 },
            ].map((star, i) => (
              <motion.span
                key={`star-${i}`}
                className="absolute rounded-full bg-white"
                style={{ top: star.top, left: star.left, width: star.size, height: star.size }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: [0.4, 0.8, 0.4], scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{
                  opacity: { duration: 2, repeat: Infinity, ease: "easeInOut", delay: star.delay },
                  scale: { duration: 0.3, delay: star.delay },
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Sun rays (visible in light mode) */}
      <AnimatePresence>
        {!isDark && (
          <motion.span
            className="absolute rounded-full"
            style={{
              left: "10px",
              top: "50%",
              width: 8,
              height: 8,
              marginTop: -4,
              background: "radial-gradient(circle, rgba(154,106,67,0.25) 0%, transparent 70%)",
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.4 }}
          />
        )}
      </AnimatePresence>
    </button>
  );
};

export default ThemeToggle;