import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API } from "../../../shared/api";
import { validate } from "../../../shared/validation";
import type { FieldRule } from "../../../shared/validation";
import LoadingOverlay from "../../../shared/LoadingOverlay";
import ErrorPopup from "../../../shared/ErrorPopup";
import { parseError, type ErrorData } from "../../../shared/apiError";
import { authFetch } from "../../../shared/auth";
import HeroBanner from "../components/HeroBanner.tsx";
import AuthCard from "../components/AuthCard.tsx";
import PasswordField from "../components/PasswordField.tsx";

const curRules: FieldRule = { required: true };
const newRules: FieldRule = { required: true, minLength: 8 };

export default function ChangePassword() {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<ErrorData | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [cTouched, setCTouched] = useState(false);
  const [nTouched, setNTouched] = useState(false);

  const cErr = cTouched ? validate(currentPassword, curRules) : null;
  const nErr = nTouched ? validate(newPassword, newRules) : null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setCTouched(true);
    setNTouched(true);
    if (validate(currentPassword, curRules) || validate(newPassword, newRules)) return;

    setError(null);
    setLoading(true);
    try {
      const res = await authFetch(API.auth.changePassword, {
        method: "PUT",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!res.ok) throw await parseError(res);
      setSuccess(true);
      setTimeout(() => navigate("/auth/login"), 1500);
    } catch (err: any) {
      setError(err.status ? err : { status: 0, error: "Error", message: err.message });
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column">
      {loading && <LoadingOverlay message="Changing your password…" />}
      <ErrorPopup error={error} onClose={() => setError(null)} />
      <HeroBanner title="Change Password" subtitle="Update your account password" />
      <AuthCard
        footer={
          <p className="text-center mb-0" style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>
            <Link to="/auth/login" style={{ color: "var(--color-accent)", fontWeight: 600 }}>Back to sign in</Link>
          </p>
        }
      >
        {success && (
          <div className="py-2 px-3 mb-3" style={{ fontSize: "13px", backgroundColor: "#F0FDF4", border: "1px solid #BBF7D0", color: "#166534", borderRadius: "8px" }}>
            Password changed successfully! Redirecting to login…
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <PasswordField label="Current Password" placeholder="Enter your current password" value={currentPassword} onChange={(v) => { setCurrentPassword(v); if (cTouched) setCTouched(true); }} onBlur={() => setCTouched(true)} error={cErr} />
          <PasswordField label="New Password" placeholder="At least 8 characters" value={newPassword} onChange={(v) => { setNewPassword(v); if (nTouched) setNTouched(true); }} onBlur={() => setNTouched(true)} error={nErr} />
          <button type="submit" className="btn btn-accent w-100 py-2 fw-semibold" style={{ fontSize: "15px" }} disabled={loading || success}>
            {loading ? "Changing…" : "Change Password"}
          </button>
        </form>
      </AuthCard>
    </div>
  );
}
