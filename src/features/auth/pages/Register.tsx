import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API } from "../../../shared/api";
import { validate } from "../../../shared/validation";
import type { FieldRule } from "../../../shared/validation";
import LoadingOverlay from "../../../shared/LoadingOverlay";
import ErrorPopup from "../../../shared/ErrorPopup";
import { parseError, type ErrorData } from "../../../shared/apiError";
import { fetchWithTimeout } from "../../../shared/fetchWithTimeout";
import PasswordField from "../components/PasswordField.tsx";
import HeroBanner from "../components/HeroBanner.tsx";
import AuthCard from "../components/AuthCard.tsx";
import TextField from "../components/TextField.tsx";

const nameRules: FieldRule = { required: true, minLength: 3, maxLength: 50 };
const emailRules: FieldRule = { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, patternMessage: "Enter a valid email" };
const pwdRules: FieldRule = { required: true, minLength: 8 };

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<ErrorData | null>(null);
  const [loading, setLoading] = useState(false);
  const [nTouched, setNTouched] = useState(false);
  const [eTouched, setETouched] = useState(false);
  const [pTouched, setPTouched] = useState(false);

  const nErr = nTouched ? validate(name, nameRules) : null;
  const eErr = eTouched ? validate(email, emailRules) : null;
  const pErr = pTouched ? validate(password, pwdRules) : null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setNTouched(true);
    setETouched(true);
    setPTouched(true);
    if (validate(name, nameRules) || validate(email, emailRules) || validate(password, pwdRules)) return;

    setError(null);
    setLoading(true);
    try {
      const res = await fetchWithTimeout(API.auth.register, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      if (!res.ok) throw await parseError(res);
      navigate(`/auth/verify-email?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      setError(err.status ? err : { status: 0, error: "Error", message: err.message });
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column">
      {loading && <LoadingOverlay message="Creating your account…" />}
      <ErrorPopup error={error} onClose={() => setError(null)} />
      <HeroBanner title="Create Account" subtitle="Join TicketSouq as a customer" />
      <AuthCard
        footer={
          <>
            <p className="text-center mb-1" style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>
              Registering an organization?{" "}
              <Link to="/auth/register/organization" style={{ color: "var(--color-accent)", fontWeight: 600 }}>Register as Organization</Link>
            </p>
            <p className="text-center mb-0" style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>
              Already have an account?{" "}
              <Link to="/auth/login" style={{ color: "var(--color-accent)", fontWeight: 600 }}>Sign in</Link>
            </p>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <TextField label="Name" placeholder="Your full name" value={name} onChange={(v) => { setName(v); if (nTouched) setNTouched(true); }} onBlur={() => setNTouched(true)} error={nErr} />
          <TextField label="Email" type="email" placeholder="you@example.com" value={email} onChange={(v) => { setEmail(v); if (eTouched) setETouched(true); }} onBlur={() => setETouched(true)} error={eErr} />
          <PasswordField label="Password" placeholder="At least 8 characters" value={password} onChange={(v) => { setPassword(v); if (pTouched) setPTouched(true); }} onBlur={() => setPTouched(true)} error={pErr} />
          <button type="submit" className="btn btn-accent w-100 py-2 fw-semibold" style={{ fontSize: "15px" }} disabled={loading}>
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>
      </AuthCard>
    </div>
  );
}
