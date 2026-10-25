const Card = ({ children, className = "", accent = false, hover = false, as: Component = "div", ...props }) => {
  return (
    <Component
      className={`rounded-2xl glass ${accent ? "circuit-corner" : ""} ${
        hover ? "transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_-20px_rgba(118,82,55,0.28)]" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
};

export default Card;
