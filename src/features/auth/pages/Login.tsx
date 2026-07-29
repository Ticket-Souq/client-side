import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { setTokens } from '../../../shared/auth';
import LoadingOverlay from '../../../shared/LoadingOverlay';
import { toast } from '../../../shared/components/display/Toast/Toast';
import AuthCard from '../components/AuthCard';
import AuthCardHeader from '../components/AuthCardHeader';
import AuthTextField from '../components/AuthTextField';
import AuthPasswordField from '../components/AuthPasswordField';
import AuthSubmitButton from '../components/AuthSubmitButton';
import { useAuthForm } from '../hooks/useAuthForm';
import { emailRules, requiredRules } from '../schemas/auth.schemas';
import { AuthService } from '../services/auth.service';

export default function Login() {
  const navigate = useNavigate();

  const { values, errors, handleChange, handleBlur, handleSubmit, loading, error, setError } =
    useAuthForm({
      fields: [
        { name: 'email', rules: emailRules },
        { name: 'password', rules: requiredRules },
      ],
      onSubmit: async (vals) => {
        let data;
        try {
          data = await AuthService.login(vals.email, vals.password);
        } catch (err: any) {
          if (err?.status === 403 || /verify|verified|not.*verified/i.test(err?.message)) {
            navigate(`/auth/verify-email?email=${encodeURIComponent(vals.email)}`);
            return;
          }
          throw err;
        }
        setTokens(data.access, data.refresh);
        navigate('/');
      },
    });

  useEffect(() => {
    if (error) {
      toast(error.message || error.error);
      setError(null);
    }
  }, [error, setError]);

  return (
    <>
      {loading && <LoadingOverlay message="Signing in..." />}
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
          <Link to="/auth/forgot-password" className="auth-forgot-link">Forgot password?</Link>
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
