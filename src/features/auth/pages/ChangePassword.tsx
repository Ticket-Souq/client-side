import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingOverlay from '../../../shared/LoadingOverlay';
import { toast } from '../../../shared/components/display/Toast/Toast';
import AuthCard from '../components/AuthCard';
import AuthCardHeader from '../components/AuthCardHeader';
import AuthPasswordField from '../components/AuthPasswordField';
import AuthSubmitButton from '../components/AuthSubmitButton';
import SuccessBanner from '../components/SuccessBanner';
import { useAuthForm } from '../hooks/useAuthForm';
import { AuthService } from '../services/auth.service';
import { passwordRules, requiredRules } from '../schemas/auth.schemas';

export default function ChangePassword() {
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);

  const { values, errors, handleChange, handleBlur, handleSubmit, loading, error, setError } =
    useAuthForm({
      fields: [
        { name: 'currentPassword', rules: requiredRules },
        { name: 'newPassword', rules: passwordRules },
        { name: 'confirmPassword', rules: passwordRules },
      ],
      onSubmit: async (vals) => {
        if (vals.newPassword !== vals.confirmPassword) {
          throw { status: 422, error: 'Validation Error', message: 'Passwords do not match' };
        }
        await AuthService.changePassword({
          currentPassword: vals.currentPassword,
          newPassword: vals.newPassword,
        });
        setSuccess(true);
        setTimeout(() => navigate('/auth/login'), 1500);
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
      {loading && <LoadingOverlay message="Changing your password..." />}
      <AuthCard>
        <AuthCardHeader
          eyebrow="Security"
          title="Change password"
        />
        {success && (
          <SuccessBanner message="Password changed successfully! Redirecting to login..." />
        )}
        <form className="auth-form" onSubmit={handleSubmit}>
          <AuthPasswordField
            label="Current password"
            value={values.currentPassword}
            onChange={(v) => handleChange('currentPassword', v)}
            onBlur={() => handleBlur('currentPassword')}
            error={errors.currentPassword}
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
          <AuthSubmitButton loading={loading} loadingText="Updating..." disabled={success}>
            Update password
          </AuthSubmitButton>
        </form>
      </AuthCard>
    </>
  );
}
