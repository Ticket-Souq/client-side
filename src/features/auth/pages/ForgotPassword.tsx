import { useNavigate, Link } from 'react-router-dom';
import LoadingOverlay from '../../../shared/LoadingOverlay';
import ErrorPopup from '../../../shared/ErrorPopup';
import AuthCard from '../components/AuthCard';
import AuthCardHeader from '../components/AuthCardHeader';
import AuthTextField from '../components/AuthTextField';
import AuthSubmitButton from '../components/AuthSubmitButton';
import { useAuthForm } from '../hooks/useAuthForm';
import { emailRules } from '../schemas/auth.schemas';
import { AuthService } from '../services/auth.service';

export default function ForgotPassword() {
  const navigate = useNavigate();

  const { values, errors, handleChange, handleBlur, handleSubmit, loading, error, setError } =
    useAuthForm({
      fields: [{ name: 'email', rules: emailRules }],
      onSubmit: async (vals) => {
        await AuthService.sendForgotPasswordCode(vals.email);
        navigate(`/auth/reset-password?email=${encodeURIComponent(vals.email)}`);
      },
    });

  return (
    <>
      {loading && <LoadingOverlay message="Sending reset link..." />}
      <ErrorPopup error={error} onClose={() => setError(null)} />
      <AuthCard>
        <AuthCardHeader
          eyebrow="Password reset"
          title="Forgot your password?"
          description="Enter your email address and we'll send you a link to reset your password."
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
          <AuthSubmitButton loading={loading} loadingText="Sending...">
            Send reset link
          </AuthSubmitButton>
        </form>
        <div className="auth-card-footer-standalone">
          <Link to="/auth/login">Back to sign in</Link>
        </div>
      </AuthCard>
    </>
  );
}
