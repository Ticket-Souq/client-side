import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import LoadingOverlay from '../../../shared/LoadingOverlay';
import { toast } from '../../../shared/components/display/Toast/Toast';
import AuthCard from '../components/AuthCard';
import AuthCardHeader from '../components/AuthCardHeader';
import AuthPasswordField from '../components/AuthPasswordField';
import AuthSubmitButton from '../components/AuthSubmitButton';
import CodeInput from '../components/CodeInput';
import { useAuthForm } from '../hooks/useAuthForm';
import { AuthService } from '../services/auth.service';
import { passwordRules, requiredRules } from '../schemas/auth.schemas';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') ?? '';

  const { values, errors, handleChange, handleBlur, handleSubmit, loading, error, setError } =
    useAuthForm({
      fields: [
        { name: 'otp', rules: requiredRules },
        { name: 'newPassword', rules: passwordRules },
        { name: 'confirmPassword', rules: passwordRules },
      ],
      onSubmit: async (vals) => {
        if (vals.newPassword !== vals.confirmPassword) {
          throw { status: 422, error: 'Validation Error', message: 'Passwords do not match' };
        }
        await AuthService.resetPassword({ otp: vals.otp, newPassword: vals.newPassword });
        navigate('/auth/login');
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
      {loading && <LoadingOverlay message="Resetting your password..." />}
      <AuthCard>
        <AuthCardHeader
          eyebrow="Password reset"
          title="Set new password"
          description={email ? `Enter the 6-digit code sent to ${email} and your new password.` : undefined}
        />
        <form className="auth-form" onSubmit={handleSubmit}>
          <CodeInput
            value={values.otp}
            onChange={(v) => handleChange('otp', v)}
            error={errors.otp}
          />
          <AuthPasswordField
            label="New password"
            value={values.newPassword}
            onChange={(v) => handleChange('newPassword', v)}
            onBlur={() => handleBlur('newPassword')}
            error={errors.newPassword}
          />
          <AuthPasswordField
            label="Confirm new password"
            value={values.confirmPassword || ''}
            onChange={(v) => handleChange('confirmPassword', v)}
            onBlur={() => handleBlur('confirmPassword')}
            error={errors.confirmPassword}
          />
          <AuthSubmitButton loading={loading} loadingText="Resetting...">
            Reset password
          </AuthSubmitButton>
        </form>
      </AuthCard>
    </>
  );
}
