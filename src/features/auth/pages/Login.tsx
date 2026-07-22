import { useState, type FormEvent, type SetStateAction} from "react";
import {useNavigate, Link} from "react-router-dom";
import {API} from "../../../shared/api";
import {validate} from "../../../shared/validation";
import type {FieldRule} from "../../../shared/validation";
import LoadingOverlay from "../../../shared/LoadingOverlay";
import ErrorPopup from "../../../shared/ErrorPopup";
import {parseError, type ErrorData} from "../../../shared/apiError";
import {fetchWithTimeout} from "../../../shared/fetchWithTimeout";
import {setTokens} from "../../../shared/auth";
import PasswordField from "../components/PasswordField.tsx";
import HeroBanner from "../components/HeroBanner.tsx";
import AuthCard from "../components/AuthCard.tsx";
import TextField from "../components/TextField.tsx";

const emailRules: FieldRule = {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    patternMessage: "Enter a valid email"
};
const pwdRules: FieldRule = {required: true};

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<ErrorData | null>(null);
    const [loading, setLoading] = useState(false);
    const [eTouched, setETouched] = useState(false);
    const [pTouched, setPTouched] = useState(false);

    const eErr = eTouched ? validate(email, emailRules) : null;
    const pErr = pTouched ? validate(password, pwdRules) : null;

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setETouched(true);
        setPTouched(true);
        if (validate(email, emailRules) || validate(password, pwdRules)) return;

        setError(null);
        setLoading(true);
        try {
            const res = await fetchWithTimeout(API.auth.login, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({email, password}),
            });
            if (!res.ok) {
                const errData = await parseError(res);
                if (errData.status === 403 || /verify|verified|not.*verified/i.test(errData.message)) {
                    navigate(`/auth/verify-email?email=${encodeURIComponent(email)}`);
                    return;
                }
                throw errData;
            }
            const data = await res.json();
            setTokens(data.access ?? data.accessToken ?? data.token ?? "", data.refresh ?? data.refreshToken);
            if (data.user) localStorage.setItem("user", JSON.stringify(data.user));
            navigate("/events");
        } catch (err: any) {
            setError(err.status ? err : {status: 0, error: "Error", message: err.message});
            setLoading(false);
        }
    };

    return (
        <div className="min-vh-100 d-flex flex-column">
            {loading && <LoadingOverlay message="Signing in…"/>}
            <ErrorPopup error={error} onClose={() => setError(null)}/>
            <HeroBanner title="Welcome Back" subtitle="Sign in to your account"/>
            <AuthCard
                footer={
                    <p className="text-center mb-0" style={{fontSize: "13px", color: "var(--color-text-secondary)"}}>
                        Don't have an account?{" "}
                        <Link to="/auth/register"
                              style={{color: "var(--color-accent)", fontWeight: 600}}>Register</Link>
                    </p>
                }
            >
                <form onSubmit={handleSubmit}>
                    <TextField label="Email" type="email" placeholder="you@example.com" value={email} onChange={(v) => {
                        setEmail(v);
                        if (eTouched) setETouched(true);
                    }} onBlur={() => setETouched(true)} error={eErr}/>
                    <PasswordField label="Password" placeholder="Enter your password" value={password} onChange={(v: SetStateAction<string>) => { setPassword(v); if (pTouched) setPTouched(true); }} onBlur={() => setPTouched(true)} error={pErr} />
          <button type="submit" className="btn btn-accent w-100 py-2 fw-semibold" style={{ fontSize: "15px" }} disabled={loading}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
          <div className="mt-3 text-center">
            <Link to="/auth/forgot-password" style={{ color: "var(--color-accent)", fontSize: "13px" }}>Forgot password?</Link>
          </div>
        </form>
      </AuthCard>
    </div>
  );
}
