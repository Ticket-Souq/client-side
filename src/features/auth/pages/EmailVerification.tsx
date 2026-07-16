import { useState, useEffect, useRef, type FormEvent } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { API } from "../../../shared/api";
import { validate, normalStyle } from "../../../shared/validation";
import type { FieldRule } from "../../../shared/validation";
import LoadingOverlay from "../../../shared/LoadingOverlay";
import ErrorPopup from "../../../shared/ErrorPopup";
import { parseError, type ErrorData } from "../../../shared/apiError";
import { fetchWithTimeout } from "../../../shared/fetchWithTimeout";
import AuthCard from "../components/AuthCard";
import TextField from "../components/TextField.tsx";
import HeroBanner from "../components/HeroBanner.tsx";

const tokenRules: FieldRule = { required: true };

export default function EmailVerification() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const emailFromUrl = searchParams.get("email") ?? "";

  const [step, setStep] = useState<"email" | "verify">("email");
  const [email, setEmail] = useState(emailFromUrl);
  const [token, setToken] = useState("");
  const [error, setError] = useState<ErrorData | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [tokenTouched, setTokenTouched] = useState(false);

  const tokenErr = tokenTouched ? validate(token, tokenRules) : null;
  const autoSent = useRef(false);

  useEffect(() => {
    if (emailFromUrl && step === "email" && !autoSent.current) {
      autoSent.current = true;
      setLoading(true);
      fetchWithTimeout(`${API.auth.verifyEmail}?email=${encodeURIComponent(emailFromUrl)}`, { method: "GET" })
        .then((res) => { if (!res.ok) throw new Error(); setSent(true); setStep("verify"); })
        .catch(() => setStep("email"))
        .finally(() => setLoading(false));
    }
  }, [emailFromUrl, step]);

  const sendCode = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetchWithTimeout(`${API.auth.verifyEmail}?email=${encodeURIComponent(email)}`, { method: "GET" });
      if (!res.ok) throw await parseError(res);
      setSent(true);
      setStep("verify");
      setLoading(false);
    } catch (err: any) {
      setError(err.status ? err : { status: 0, error: "Error", message: err.message });
      setLoading(false);
    }
  };

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();
    setTokenTouched(true);
    if (validate(token, tokenRules)) return;

    setError(null);
    setLoading(true);
    try {
      const res = await fetchWithTimeout(API.auth.verifyEmail, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: token,
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
      {loading && <LoadingOverlay message={step === "email" ? "Sending verification code…" : "Verifying your email…"} />}
      <ErrorPopup error={error} onClose={() => setError(null)} />
      <HeroBanner
        title="Email Verification"
        subtitle={step === "email" ? "Enter your email to receive a verification code" : "Enter the verification code sent to your email"}
      />
      <AuthCard
        footer={
          <p className="text-center mb-0" style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>
            Already verified?{" "}
            <Link to="/auth/login" style={{ color: "var(--color-accent)", fontWeight: 600 }}>Sign in</Link>
          </p>
        }
      >
        {step === "email" ? (
          <form onSubmit={(e) => { e.preventDefault(); sendCode(); }}>
            <TextField label="Email" type="email" placeholder="you@example.com" value={email} onChange={setEmail} />
            <button type="submit" className="btn btn-accent w-100 py-2 fw-semibold" style={{ fontSize: "15px" }} disabled={loading}>
              {loading ? "Sending…" : "Send Verification Code"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify}>
            {sent && (
              <div className="py-2 px-3 mb-3 d-flex align-items-center justify-content-between" style={{ fontSize: "13px", backgroundColor: "#F0FDF4", border: "1px solid #BBF7D0", color: "#166534", borderRadius: "8px" }}>
                <span>A verification code has been sent to your email.</span>
                <button type="button" className="btn btn-sm fw-semibold" style={{ color: "var(--color-accent)", background: "none", border: "none", fontSize: "12px", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.5 : 1 }} disabled={loading} onClick={sendCode}>
                  {loading ? "Sending…" : "Resend"}
                </button>
              </div>
            )}
            <div className="mb-3">
              <label className="form-label mb-1" style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-text)" }}>Verification Code</label>
              <input type="text" className="form-control" placeholder="Enter the code from your email" value={token}
                onChange={(e) => { setToken(e.target.value); if (tokenTouched) setTokenTouched(true); }}
                onBlur={() => setTokenTouched(true)}
                style={tokenErr ? { border: "1px solid #DC2626", boxShadow: "0 0 0 3px rgba(220,38,38,0.15)", fontSize: "14px", borderRadius: "8px", padding: "10px 12px" } : normalStyle}
              />
              {tokenErr && <div style={{ fontSize: "12px", color: "#DC2626", marginTop: "4px" }}>{tokenErr}</div>}
            </div>
            <button type="submit" className="btn btn-accent w-100 py-2 fw-semibold" style={{ fontSize: "15px" }} disabled={loading}>
              {loading ? "Verifying…" : "Verify Email"}
            </button>
          </form>
        )}
      </AuthCard>
    </div>
  );
}
