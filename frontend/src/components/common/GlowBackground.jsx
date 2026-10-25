const GlowBackground = ({ variant = "default" }) => {
  if (variant === "auth") {
    return (
      <>
        <div className="ambient-glow bg-violet-600/30 w-[500px] h-[500px] -top-40 -left-40" />
        <div className="ambient-glow bg-cyan-500/20 w-[400px] h-[400px] -bottom-32 -right-32" />
      </>
    );
  }
  return (
    <>
      <div className="ambient-glow bg-magenta/20 w-[600px] h-[600px] -top-52 -left-52" />
      <div className="ambient-glow bg-blue-600/20 w-[550px] h-[550px] top-1/3 -right-52" />
      <div className="ambient-glow bg-violet-600/15 w-[500px] h-[500px] bottom-0 left-1/4" />
    </>
  );
};

export default GlowBackground;
