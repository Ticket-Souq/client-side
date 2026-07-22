import { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API } from '../../../shared/api';
import { fetchWithTimeout } from '../../../shared/fetchWithTimeout';
import { setTokens } from '../../../shared/auth';
import { parseError } from '../../../shared/apiError';
import LoadingOverlay from '../../../shared/LoadingOverlay';
import ErrorPopup from '../../../shared/ErrorPopup';
import AuthCard from '../components/AuthCard';
import AuthCardHeader from '../components/AuthCardHeader';
import AuthTextField from '../components/AuthTextField';
import AuthPasswordField from '../components/AuthPasswordField';
import AuthSubmitButton from '../components/AuthSubmitButton';
import AuthToggle from '../components/AuthToggle';
import { useAuthForm } from '../hooks/useAuthForm';
import { emailRules, requiredRules } from '../schemas/auth.schemas';

export default function Login() {
  const navigate = useNavigate();
  const [rememberMe, setRememberMe] = useState(false);

  const { values, errors, handleChange, handleBlur, handleSubmit, loading, error, setError } =
    useAuthForm({
      fields: [
        { name: 'email', rules: emailRules },
        { name: 'password', rules: requiredRules },
      ],
      onSubmit: async (vals) => {
        const res = await fetchWithTimeout(API.auth.login, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: vals.email, password: vals.password }),
        });
        if (!res.ok) {
          const errData = await parseError(res);
          if (errData.status === 403 || /verify|verified|not.*verified/i.test(errData.message)) {
            navigate(`/auth/verify-email?email=${encodeURIComponent(vals.email)}`);
            return;
          }
          throw errData;
        }
        const data = await res.json();
        setTokens(data.access ?? data.accessToken ?? data.token ?? '', data.refresh ?? data.refreshToken);
        if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/events');
      },
    });

  return (
    <>
      {loading && <LoadingOverlay message="Signing in..." />}
      <ErrorPopup error={error} onClose={() => setError(null)} />
      <AuthCard>
        <AuthCardHeader
          eyebrow="Welcome back"
          title="Sign in to your account"
        />
        <form className="auth-form" onSubmit={handleSubmit}>
          <AuthTextField
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={values.email}
            onChange={(v) => handleChange('email', v)}
            onBlur={() => handleBlur('email')}
            error={errors.email}
          />
          <AuthPasswordField
            label="Password"
            value={values.password}
            onChange={(v) => handleChange('password', v)}
            onBlur={() => handleBlur('password')}
            error={errors.password}
          />
          <div className="auth-checkbox-row">
            <AuthToggle checked={rememberMe} onChange={setRememberMe} label="Remember me" />
            <Link to="/auth/forgot-password">Forgot password?</Link>
          </div>
          <AuthSubmitButton loading={loading} loadingText="Signing in...">
            Sign in
          </AuthSubmitButton>
        </form>
        <div className="auth-card-footer">
          <p>
            Don't have an account? <Link to="/auth/register">Sign up</Link>
          </p>
        </div>
      </AuthCard>
    </>
  );
}
