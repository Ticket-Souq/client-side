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
import TextField from "../components/TextField.tsx";
import AuthCard from "../components/AuthCard.tsx";
import HeroBanner from "../components/HeroBanner.tsx";


type Step = "email" | "reset";

const emailRules: FieldRule = { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, patternMessage: "Enter a valid email" };
const tokenRules: FieldRule = { required: true };
const pwdRules: FieldRule = { required: true, minLength: 8 };

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<ErrorData | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [eTouched, setETouched] = useState(false);
  const [tTouched, setTTouched] = useState(false);
  const [pTouched, setPTouched] = useState(false);

  const eErr = eTouched ? validate(email, emailRules) : null;
  const tErr = tTouched ? validate(token, tokenRules) : null;
  const pErr = pTouched ? validate(newPassword, pwdRules) : null;

  const sendCode = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetchWithTimeout(`${API.auth.forgotPassword}?email=${encodeURIComponent(email)}`, { method: "GET" });
      if (!res.ok) throw await parseError(res);
      setSent(true);
      setStep("reset");
      setLoading(false);
    } catch (err: any) {
      setError(err.status ? err : { status: 0, error: "Error", message: err.message });
      setLoading(false);
    }
  };

  const handleReset = async (e: FormEvent) => {
    e.preventDefault();
    setTTouched(true);
    setPTouched(true);
    if (validate(token, tokenRules) || validate(newPassword, pwdRules)) return;

    setError(null);
    setLoading(true);
    try {
      const res = await fetchWithTimeout(API.auth.forgotPassword, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      if (!res.ok) throw await parseError(res);
      navigate("/auth/login");
    } catch (err: any) {
      setError(err.status ? err : { status: 0, error: "Error", message: err.message });
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column">
      {loading && <LoadingOverlay message={step === "email" ? "Sending reset code…" : "Resetting your password…"} />}
      <ErrorPopup error={error} onClose={() => setError(null)} />
      <HeroBanner
        title="Reset Password"
        subtitle={step === "email" ? "Enter your email to receive a reset code" : "Enter the reset code and your new password"}
      />
      <AuthCard
        footer={
          <p className="text-center mb-0" style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>
            Remember your password?{" "}
            <Link to="/auth/login" style={{ color: "var(--color-accent)", fontWeight: 600 }}>Sign in</Link>
          </p>
        }
      >
        {step === "email" ? (
          <form onSubmit={(e) => { e.preventDefault(); setETouched(true); if (!validate(email, emailRules)) sendCode(); }}>
            <TextField label="Email" type="email" placeholder="you@example.com" value={email} onChange={(v) => { setEmail(v); if (eTouched) setETouched(true); }} onBlur={() => setETouched(true)} error={eErr} />
            <button type="submit" className="btn btn-accent w-100 py-2 fw-semibold" style={{ fontSize: "15px" }} disabled={loading}>
              {loading ? "Sending…" : "Send Reset Code"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleReset}>
            {sent && (
              <div className="py-2 px-3 mb-3 d-flex align-items-center justify-content-between" style={{ fontSize: "13px", backgroundColor: "#F0FDF4", border: "1px solid #BBF7D0", color: "#166534", borderRadius: "8px" }}>
                <span>A reset code has been sent to your email.</span>
                <button type="button" className="btn btn-sm fw-semibold" style={{ color: "var(--color-accent)", background: "none", border: "none", fontSize: "12px", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.5 : 1 }} disabled={loading} onClick={sendCode}>
                  {loading ? "Sending…" : "Resend"}
                </button>
              </div>
            )}
            <TextField label="Reset Code" placeholder="Enter the code from your email" value={token} onChange={(v) => { setToken(v); if (tTouched) setTTouched(true); }} onBlur={() => setTTouched(true)} error={tErr} />
            <PasswordField label="New Password" placeholder="At least 8 characters" value={newPassword} onChange={(v) => { setNewPassword(v); if (pTouched) setPTouched(true); }} onBlur={() => setPTouched(true)} error={pErr} />
            <button type="submit" className="btn btn-accent w-100 py-2 fw-semibold" style={{ fontSize: "15px" }} disabled={loading}>
              {loading ? "Resetting…" : "Reset Password"}
            </button>
          </form>
        )}
      </AuthCard>
    </div>
  );
}
