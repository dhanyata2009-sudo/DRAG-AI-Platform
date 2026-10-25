import { useRef, useState } from "react";
import { Camera } from "lucide-react";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import { Field, Input } from "../components/common/FormFields";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../context/ToastContext";
import { changePassword } from "../services/authService";

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const activeUser = user || { name: "", email: "", avatarUrl: null };
  const [form, setForm] = useState({ name: activeUser.name, email: activeUser.email });
  const [saved, setSaved] = useState(false);
  const fileRef = useRef(null);

  const [passwordForm, setPasswordForm] = useState({ current: "", new: "", confirmNew: "" });
  const [passwordError, setPasswordError] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    // TODO (backend): await updateProfile(form);
    updateUser(form);
    setSaved(true);
    showToast("Profile updated");
    setTimeout(() => setSaved(false), 2000);
  };

  const initials = activeUser.name ? activeUser.name.split(" ").map((n) => n[0]).join("").slice(0, 2) : "U";

  const changeAvatar = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 2_000_000) {
      showToast("Choose an image smaller than 2 MB", "info");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => { updateUser({ avatarUrl: reader.result }); showToast("Profile picture updated"); };
    reader.readAsDataURL(file);
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setPasswordError("");

    if (passwordForm.new !== passwordForm.confirmNew) {
      setPasswordError("New passwords don't match.");
      return;
    }
    if (passwordForm.new.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }

    setPasswordLoading(true);
    try {
      await changePassword({
        currentPassword: passwordForm.current,
        newPassword: passwordForm.new,
      });
      showToast("Password changed successfully");
      setPasswordForm({ current: "", new: "", confirmNew: "" });
    } catch (err) {
      setPasswordError(err.response?.data?.error || "Failed to change password.");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h2 className="font-display text-2xl font-semibold text-body">Profile</h2>

      <Card className="p-6 sm:p-8">
        <div className="flex items-center gap-5 mb-8">
          <div className="relative">
            <div className="h-20 w-20 overflow-hidden rounded-full bg-gradient-brand flex items-center justify-center text-white text-2xl font-semibold">
              {activeUser.avatarUrl ? <img src={activeUser.avatarUrl} alt="Profile" className="h-full w-full object-cover" /> : initials}
            </div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full glass flex items-center justify-center text-body"
              aria-label="Change profile picture"
            >
              <Camera size={14} />
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={changeAvatar} className="sr-only" />
          </div>
          <div>
            <p className="font-display font-semibold text-body text-lg">{activeUser.name}</p>
            <p className="text-sm text-subtle">Account details are loaded from the backend.</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Full name" id="name">
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="Email address" id="email">
              <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </Field>
          </div>
          <div className="flex items-center gap-3">
            <Button type="submit">Save changes</Button>
            {saved && <span className="text-xs text-cyan-400">Saved ?</span>}
          </div>
        </form>
      </Card>

      <Card className="p-6 sm:p-8">
        <h3 className="font-display font-semibold text-body mb-4">Change password</h3>
        <form className="space-y-5" onSubmit={handlePasswordSubmit}>
          <Field label="Current password" id="current">
            <Input
              id="current"
              type="password"
              required
              value={passwordForm.current}
              onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
            />
          </Field>
          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="New password" id="new" hint="At least 6 characters">
              <Input
                id="new"
                type="password"
                required
                minLength={6}
                value={passwordForm.new}
                onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
              />
            </Field>
            <Field label="Confirm new password" id="confirmNew" error={passwordError}>
              <Input
                id="confirmNew"
                type="password"
                required
                minLength={6}
                value={passwordForm.confirmNew}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmNew: e.target.value })}
              />
            </Field>
          </div>
          <Button type="submit" variant="secondary" disabled={passwordLoading}>
            {passwordLoading ? "Updating..." : "Update password"}
          </Button>
        </form>
      </Card>

    </div>
  );
};

export default ProfilePage;
