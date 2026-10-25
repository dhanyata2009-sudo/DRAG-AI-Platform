import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Button from "../components/common/Button";
import { Field, Input } from "../components/common/FormFields";
import { resetPassword } from "../services/authService";
import { ROUTES } from "../utils/constants";

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError("Passwords don't match.");
      return;
    }
    setError("");
    setNotice("");
    setLoading(true);
    try {
      await resetPassword({ token, newPassword: form.password });
      setNotice("Password updated. Redirecting to login...");
      setTimeout(() => navigate(ROUTES.LOGIN), 1500);
    } catch (err) {
      setNotice(err.response?.data?.error || "Reset link may be invalid or expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <h1 className="font-display text-3xl font-semibold text-body">Set a new password</h1>
      <p className="text-subtle text-sm mt-2 mb-8">Choose a strong password you haven't used before.</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Field label="New password" required id="password" hint="At least 6 characters">
          <Input
            id="password"
            type="password"
            required
            minLength={6}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </Field>
        <Field label="Confirm password" required id="confirm" error={error}>
          <Input
            id="confirm"
            type="password"
            required
            minLength={6}
            value={form.confirm}
            onChange={(e) => setForm({ ...form, confirm: e.target.value })}
          />
        </Field>
        <Button type="submit" fullWidth size="lg" icon={ArrowRight} iconPosition="right" disabled={loading}>
          {loading ? "Updating..." : "Update password"}
        </Button>
        {notice && <p className="text-sm text-subtle text-center" role="status">{notice}</p>}
      </form>
    </motion.div>
  );
};

export default ResetPasswordPage;
