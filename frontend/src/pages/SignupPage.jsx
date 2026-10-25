import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import Button from "../components/common/Button";
import { Field, Input } from "../components/common/FormFields";
import { ROUTES } from "../utils/constants";
import { registerUser } from "../services/authService";
import { useAuth } from "../hooks/useAuth";

const SignupPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const navigate = useNavigate();
const { login } = useAuth();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setNotice("");

  try {
    const data = await registerUser({
      name: form.name,
      email: form.email,
      password: form.password,
    });

    if (data.success) {
      // Store authenticated user in frontend auth state (and the JWT
      // token, so subsequent API requests are authorized)
      login(data.user, true, data.token);

      // Go to projects/dashboard
      navigate(ROUTES.PROJECTS, { replace: true });
    }
  } catch (error) {
    setNotice(
      error.response?.data?.error ||
      "Account creation failed. Please try again."
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <h1 className="font-display text-3xl font-semibold text-body">Create your account</h1>
      <p className="text-subtle text-sm mt-2 mb-8">Create video and presentation projects from one workspace.</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Field label="Full name" required id="name">
          <Input id="name" name="name" placeholder="Your full name" required value={form.name} onChange={handleChange} />
        </Field>
        <Field label="Email address" required id="email">
          <Input id="email" name="email" type="email" placeholder="you@brand.com" required value={form.email} onChange={handleChange} />
        </Field>
        <Field label="Password" required id="password" hint="At least 8 characters">
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              required
              minLength={8}
              value={form.password}
              onChange={handleChange}
              className="pr-11"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-faint hover:text-body"
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </Field>

        <Button type="submit" fullWidth size="lg" icon={ArrowRight} iconPosition="right" disabled={loading}>
          {loading ? "Creating account…" : "Create account"}
        </Button>
        {notice && <p className="text-sm text-subtle text-center" role="status">{notice}</p>}
      </form>

      <p className="text-center text-sm text-subtle mt-8">
        Already have an account?{" "}
        <Link to={ROUTES.LOGIN} className="text-body font-medium hover:text-violet-400">
          Log in
        </Link>
      </p>
    </motion.div>
  );
};

export default SignupPage;
