import Card from "../components/common/Card";
import ThemeToggle from "../components/common/ThemeToggle";
import { useTheme } from "../hooks/useTheme";
import { useWorkspace } from "../hooks/useWorkspace";
import { useToast } from "../context/ToastContext";

const SettingsPage = () => {
  const { theme } = useTheme();
  const { preferences, updatePreferences } = useWorkspace();
  const { showToast } = useToast();

  const options = [
    ["emailNotifications", "Email notifications"],
    ["pushNotifications", "Push notifications"],
    ["autoSave", "Auto-save projects"],
  ];

  return (
    <div className="max-w-2xl space-y-6">
      <h2 className="font-display text-2xl font-semibold text-body">Settings</h2>

      <Card className="p-6 sm:p-8 flex items-center justify-between">
        <div>
          <h3 className="font-display font-semibold text-body">Appearance</h3>
          <p className="text-sm text-subtle mt-1">
            Currently using <span className="text-body font-medium capitalize">{theme}</span> mode.
          </p>
        </div>
        <ThemeToggle />
      </Card>

      <Card className="p-6 sm:p-8 space-y-5">
        <h3 className="font-display font-semibold text-body">Preferences</h3>
        {options.map(([key, label]) => (
          <label key={key} className="flex items-center justify-between gap-5 text-sm text-subtle cursor-pointer">
            {label}
            <input
              type="checkbox"
              checked={Boolean(preferences[key])}
              onChange={(event) => { updatePreferences({ [key]: event.target.checked }); showToast("Settings saved"); }}
              className="h-4 w-4 rounded accent-violet-600"
            />
          </label>
        ))}
      </Card>
    </div>
  );
};

export default SettingsPage;
