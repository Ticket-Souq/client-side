import { useState, useCallback, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import LoadingOverlay from '../../../shared/LoadingOverlay';
import { toast } from '../../../shared/components/display/Toast/Toast';
import AuthCard from '../components/AuthCard';
import AuthCardHeader from '../components/AuthCardHeader';
import AuthTextField from '../components/AuthTextField';
import AuthPasswordField from '../components/AuthPasswordField';
import AuthSubmitButton from '../components/AuthSubmitButton';
import AuthTabs from '../components/AuthTabs';
import { useAuthForm } from '../hooks/useAuthForm';
import { emailRules, passwordRules, nameRules, orgNameRules } from '../schemas/auth.schemas';
import type { AuthTabType } from '../types/auth.types';
import { AuthService } from '../services/auth.service';

export default function Register() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<AuthTabType>('customer');

  const baseFields = [
    { name: 'email', rules: emailRules },
    { name: 'password', rules: passwordRules },
    { name: 'confirmPassword', rules: passwordRules },
  ];

  const customerFields = [{ name: 'name', rules: nameRules }, ...baseFields];
  const orgFields = [
    { name: 'orgName', rules: orgNameRules },
    { name: 'name', rules: nameRules },
    ...baseFields,
  ];

  const fields = tab === 'customer' ? customerFields : orgFields;

  const { values, errors, handleChange, handleBlur, handleSubmit, loading, error, setError } =
    useAuthForm({
      fields,
      onSubmit: async (vals) => {
        if (vals.password !== vals.confirmPassword) {
          throw { status: 422, error: 'Validation Error', message: 'Passwords do not match' };
        }

        const payload: Record<string, string> = {
          name: vals.name,
          email: vals.email,
          password: vals.password,
        };
        if (tab === 'organization') {
          payload.OrganizationName = vals.orgName;
        }

        await AuthService.register(payload);
        navigate(`/auth/verify-email?email=${encodeURIComponent(vals.email)}`);
      },
    });

  useEffect(() => {
    if (error) {
      toast(error.message || error.error);
      setError(null);
    }
  }, [error, setError]);

  const handleTabChange = useCallback(
    (newTab: AuthTabType) => {
      setTab(newTab);
    },
    []
  );

  return (
    <>
      {loading && <LoadingOverlay message="Creating your account..." />}
      <AuthCard>
        <AuthCardHeader
          eyebrow="Get started"
          title="Create your account"
        />
        <AuthTabs active={tab} onChange={handleTabChange} />
        <form className="auth-form" onSubmit={handleSubmit}>
          {tab === 'organization' && (
            <AuthTextField
              label="Organization name"
              placeholder="Your organization name"
              value={values.orgName || ''}
              onChange={(v) => handleChange('orgName', v)}
              onBlur={() => handleBlur('orgName')}
              error={errors.orgName}
            />
          )}
          <AuthTextField
            label="Full name"
            placeholder="John Doe"
            value={values.name || ''}
            onChange={(v) => handleChange('name', v)}
            onBlur={() => handleBlur('name')}
            error={errors.name}
          />
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
          <AuthPasswordField
            label="Confirm password"
            value={values.confirmPassword || ''}
            onChange={(v) => handleChange('confirmPassword', v)}
            onBlur={() => handleBlur('confirmPassword')}
            error={errors.confirmPassword}
          />
          <AuthSubmitButton loading={loading} loadingText="Creating account...">
            Create account
          </AuthSubmitButton>
        </form>
        <div className="auth-card-footer">
          <p>
            Already have an account? <Link to="/auth/login">Sign in</Link>
          </p>
        </div>
      </AuthCard>
    </>
  );
}
