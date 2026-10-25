import { useState } from "react";
import { Navigate, useLocation, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import Button from "../components/common/Button";
import { Field, Input } from "../components/common/FormFields";
import { useAuth } from "../hooks/useAuth";
import { loginUser } from "../services/authService";
import { ROUTES } from "../utils/constants";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ loginId: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setNotice("");

    try {
      const data = await loginUser({
        email: form.loginId,
        password: form.password,
      });

      login(data.user, true, data.token);
      navigate(location.state?.from?.pathname || ROUTES.PROJECTS, { replace: true });
    } catch (err) {
      setNotice(err.response?.data?.message || "Incorrect email or password.");
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated) return <Navigate to={ROUTES.PROJECTS} replace />;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <h1 className="font-display text-3xl font-semibold text-body">Welcome back</h1>
      <p className="text-subtle text-sm mt-2 mb-6">Log in to open the Video and PPT Generation workspace.</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Field label="Login ID" required id="loginId">
          <Input id="loginId" name="loginId" type="text" autoComplete="username" placeholder="Enter email" required value={form.loginId} onChange={handleChange} />
        </Field>
        <Field label="Password" required id="password">
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="********"
              required
              autoComplete="current-password"
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

        <div className="flex justify-end">
          <Link to={ROUTES.FORGOT_PASSWORD} className="text-sm text-subtle hover:text-body font-medium">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" fullWidth size="lg" icon={ArrowRight} iconPosition="right" disabled={loading}>
          {loading ? "Logging in..." : "Log in"}
        </Button>
        {notice && <p className="text-sm text-rose-500 text-center" role="alert">{notice}</p>}
      </form>

      <p className="text-center text-sm text-subtle mt-8">
        Don't have an account?{" "}
        <Link to={ROUTES.SIGNUP} className="text-body font-medium hover:text-violet-400">
          Sign up
        </Link>
      </p>
    </motion.div>
  );
};

export default LoginPage;
