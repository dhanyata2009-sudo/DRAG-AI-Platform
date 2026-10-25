import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft } from "lucide-react";
import Button from "../components/common/Button";
import { Field, Input } from "../components/common/FormFields";
import { ROUTES } from "../utils/constants";
import { requestPasswordReset } from "../services/authService";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setNotice("");
    try {
      await requestPasswordReset(email);
      setNotice("If an account exists for that email, a reset link has been sent.");
    } catch (error) {
      setNotice(error.response?.data?.error || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <h1 className="font-display text-3xl font-semibold text-body">Forgot password</h1>
      <p className="text-subtle text-sm mt-2 mb-8">Enter your email and we'll send you a reset link.</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Field label="Email address" required id="email">
          <Input id="email" type="email" placeholder="you@brand.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Button type="submit" fullWidth size="lg" icon={ArrowRight} iconPosition="right" disabled={loading}>
          {loading ? "Sending..." : "Send reset link"}
        </Button>
        {notice && <p className="text-sm text-subtle text-center" role="status">{notice}</p>}
      </form>

      <Link to={ROUTES.LOGIN} className="inline-flex items-center gap-1.5 text-sm text-subtle hover:text-body mt-8 font-medium">
        <ArrowLeft size={15} /> Back to log in
      </Link>
    </motion.div>
  );
};

export default ForgotPasswordPage;
