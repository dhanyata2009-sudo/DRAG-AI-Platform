import { motion } from "framer-motion";

const variants = {
  primary: "bg-gradient-brand text-white shadow-[0_8px_30px_-8px_rgba(118,82,55,0.42)] hover:brightness-110",
  secondary: "glass text-body hover:bg-panel-hover",
  ghost: "text-body hover:bg-panel-2",
  outline: "border border-app text-body hover:bg-panel-2",
  danger: "bg-rose-600 text-white hover:bg-rose-500",
};

const sizes = {
  sm: "text-sm px-3.5 py-2 rounded-lg",
  md: "text-sm px-5 py-2.5 rounded-xl",
  lg: "text-base px-7 py-3.5 rounded-xl",
};

const Button = ({
  as: Component = "button",
  variant = "primary",
  size = "md",
  icon: Icon,
  iconPosition = "left",
  fullWidth = false,
  className = "",
  children,
  ...props
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.98 }}
      className={fullWidth ? "w-full" : "inline-block"}
    >
      <Component
        className={`inline-flex items-center justify-center gap-2 font-medium transition-colors duration-200 disabled:opacity-50 disabled:pointer-events-none ${variants[variant]} ${sizes[size]} ${fullWidth ? "w-full" : ""} ${className}`}
        {...props}
      >
        {Icon && iconPosition === "left" && <Icon size={17} strokeWidth={2} />}
        {children}
        {Icon && iconPosition === "right" && <Icon size={17} strokeWidth={2} />}
      </Component>
    </motion.div>
  );
};

export default Button;
