import { useNavigate, useSearchParams } from 'react-router-dom';
import { parseError } from '../../../shared/apiError';
import LoadingOverlay from '../../../shared/LoadingOverlay';
import ErrorPopup from '../../../shared/ErrorPopup';
import AuthCard from '../components/AuthCard';
import AuthCardHeader from '../components/AuthCardHeader';
import AuthPasswordField from '../components/AuthPasswordField';
import AuthSubmitButton from '../components/AuthSubmitButton';
import { useAuthForm } from '../hooks/useAuthForm';
import { AuthService } from '../services/auth.service';
import { passwordRules } from '../schemas/auth.schemas';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const email = searchParams.get('email') ?? '';

  const { values, errors, handleChange, handleBlur, handleSubmit, loading, error, setError } =
    useAuthForm({
      fields: [
        { name: 'newPassword', rules: passwordRules },
        { name: 'confirmPassword', rules: passwordRules },
      ],
      onSubmit: async (vals) => {
        if (vals.newPassword !== vals.confirmPassword) {
          throw { status: 422, error: 'Validation Error', message: 'Passwords do not match' };
        }
        const res = await AuthService.resetPassword({
          token,
          newPassword: vals.newPassword,
        });
        if (!res.ok) throw await parseError(res);
        navigate('/auth/login');
      },
    });

  return (
    <>
      {loading && <LoadingOverlay message="Resetting your password..." />}
      <ErrorPopup error={error} onClose={() => setError(null)} />
      <AuthCard>
        <AuthCardHeader
          eyebrow="Password reset"
          title="Set new password"
        />
        <form className="auth-form" onSubmit={handleSubmit}>
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
