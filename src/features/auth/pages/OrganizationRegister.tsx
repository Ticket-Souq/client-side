import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API } from "../../../shared/api";
import { validate } from "../../../shared/validation";
import type { FieldRule } from "../../../shared/validation";
import LoadingOverlay from "../../../shared/LoadingOverlay";
import ErrorPopup from "../../../shared/ErrorPopup";
import { parseError, type ErrorData } from "../../../shared/apiError";
import { fetchWithTimeout } from "../../../shared/fetchWithTimeout";
import AuthCard from "../components/AuthCard";
import PasswordField from "../components/PasswordField.tsx";
import HeroBanner from "../components/HeroBanner.tsx";
import TextField from "../components/TextField.tsx";


const orgRules: FieldRule = { required: true, minLength: 3, maxLength: 50 };
const nameRules: FieldRule = { required: true, minLength: 3, maxLength: 50 };
const emailRules: FieldRule = { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, patternMessage: "Enter a valid email" };
const pwdRules: FieldRule = { required: true, minLength: 8 };

export default function OrganizationRegister() {
  const navigate = useNavigate();
  const [orgName, setOrgName] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<ErrorData | null>(null);
  const [loading, setLoading] = useState(false);
  const [oTouched, setOTouched] = useState(false);
  const [nTouched, setNTouched] = useState(false);
  const [eTouched, setETouched] = useState(false);
  const [pTouched, setPTouched] = useState(false);

  const oErr = oTouched ? validate(orgName, orgRules) : null;
  const nErr = nTouched ? validate(name, nameRules) : null;
  const eErr = eTouched ? validate(email, emailRules) : null;
  const pErr = pTouched ? validate(password, pwdRules) : null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setOTouched(true);
    setNTouched(true);
    setETouched(true);
    setPTouched(true);
    if (validate(orgName, orgRules) || validate(name, nameRules) || validate(email, emailRules) || validate(password, pwdRules)) return;

    setError(null);
    setLoading(true);
    try {
      const res = await fetchWithTimeout(API.auth.register, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, OrganizationName: orgName }),
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
      {loading && <LoadingOverlay message="Registering your organization…" />}
      <ErrorPopup error={error} onClose={() => setError(null)} />
      <HeroBanner title="Organization Registration" subtitle="Register your organization on TicketSouq" />
      <AuthCard
        footer={
          <p className="text-center mb-0" style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>
            Already have an account?{" "}
            <Link to="/auth/login" style={{ color: "var(--color-accent)", fontWeight: 600 }}>Sign in</Link>
          </p>
        }
      >
        <form onSubmit={handleSubmit}>
          <TextField label="Organization Name" placeholder="Your organization name" value={orgName} onChange={(v) => { setOrgName(v); if (oTouched) setOTouched(true); }} onBlur={() => setOTouched(true)} error={oErr} />
          <TextField label="Your Name" placeholder="Your full name" value={name} onChange={(v) => { setName(v); if (nTouched) setNTouched(true); }} onBlur={() => setNTouched(true)} error={nErr} />
          <TextField label="Email" type="email" placeholder="you@organization.com" value={email} onChange={(v) => { setEmail(v); if (eTouched) setETouched(true); }} onBlur={() => setETouched(true)} error={eErr} />
          <PasswordField label="Password" placeholder="At least 8 characters" value={password} onChange={(v) => { setPassword(v); if (pTouched) setPTouched(true); }} onBlur={() => setPTouched(true)} error={pErr} />
          <button type="submit" className="btn btn-accent w-100 py-2 fw-semibold" style={{ fontSize: "15px" }} disabled={loading}>
            {loading ? "Registering…" : "Register Organization"}
          </button>
        </form>
      </AuthCard>
    </div>
  );
}
