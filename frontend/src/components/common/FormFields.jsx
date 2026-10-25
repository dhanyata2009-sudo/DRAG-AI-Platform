const baseField =
  "w-full rounded-xl border border-app bg-panel-2 px-4 py-2.5 text-sm text-body placeholder:text-faint outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-violet-500/60";

export const Field = ({ label, hint, error, required, children, id }) => (
  <div className="w-full">
    {label && (
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-body">
        {label} {required && <span className="text-magenta">*</span>}
      </label>
    )}
    {children}
    {hint && !error && <p className="mt-1.5 text-xs text-subtle">{hint}</p>}
    {error && <p className="mt-1.5 text-xs text-rose-400">{error}</p>}
  </div>
);

export const Input = ({ className = "", ...props }) => (
  <input className={`${baseField} ${className}`} {...props} />
);

export const Textarea = ({ className = "", rows = 4, ...props }) => (
  <textarea rows={rows} className={`${baseField} resize-none ${className}`} {...props} />
);

export const Select = ({ className = "", children, ...props }) => (
  <select className={`${baseField} appearance-none cursor-pointer ${className}`} {...props}>
    {children}
  </select>
);

export default Input;
