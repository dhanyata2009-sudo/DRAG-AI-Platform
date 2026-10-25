import { Check } from "lucide-react";

const StepIndicator = ({ steps, currentStep }) => {
  return (
    <ol className="flex items-center w-full overflow-x-auto no-scrollbar pb-1" aria-label="Project creation progress">
      {steps.map((step, i) => {
        const index = i + 1;
        const isDone = index < currentStep;
        const isActive = index === currentStep;
        return (
          <li key={step} className="flex items-center flex-1 min-w-[110px] last:flex-none last:min-w-0" aria-current={isActive ? "step" : undefined}>
            <div className="flex flex-col items-center gap-2 shrink-0">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-mono transition-all duration-300 ${
                  isDone
                    ? "bg-gradient-brand border-transparent text-white"
                    : isActive
                    ? "border-violet-500 text-body shadow-[0_0_0_4px_rgba(118,82,55,0.14)]"
                    : "border-app text-faint"
                }`}
              >
                {isDone ? <Check size={15} aria-hidden="true" /> : index}
              </div>
              <span className={`text-[11px] font-medium text-center whitespace-nowrap ${isActive ? "text-body" : "text-faint"}`}>
                {step}
              </span>
            </div>
            {index !== steps.length && (
              <div className="flex-1 h-px mx-2 mb-5" style={{
                background: isDone
                  ? "linear-gradient(90deg, var(--color-violet), var(--color-blue))"
                  : "var(--c-border)",
              }} />
            )}
          </li>
        );
      })}
    </ol>
  );
};

export default StepIndicator;
