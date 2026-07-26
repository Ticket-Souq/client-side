import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import LoadingOverlay from '../../../shared/LoadingOverlay';
import ErrorPopup from '../../../shared/ErrorPopup';
import AuthCard from '../components/AuthCard';
import AuthCardHeader from '../components/AuthCardHeader';
import AuthTextField from '../components/AuthTextField';
import AuthSubmitButton from '../components/AuthSubmitButton';
import CodeInput from '../components/CodeInput';
import SuccessBanner from '../components/SuccessBanner';
import { useAuthForm } from '../hooks/useAuthForm';
import { AuthService } from '../services/auth.service';
import { requiredRules } from '../schemas/auth.schemas';

export default function EmailVerification() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const emailFromUrl = searchParams.get('email') ?? '';

  const [step, setStep] = useState<'email' | 'verify'>('email');
  const [email, setEmail] = useState(emailFromUrl);
  const [sent, setSent] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);
  const autoSent = useRef(false);

  const { values, errors, handleChange, handleSubmit, loading, error, setError } =
    useAuthForm({
      fields: [{ name: 'otp', rules: requiredRules }],
      onSubmit: async (vals) => {
        await AuthService.verifyEmail(vals.otp);
        navigate('/auth/login');
      },
    });

  const sendCode = useCallback(
    async (emailAddr: string) => {
      setError(null);
      setSendLoading(true);
      try {
        await AuthService.sendVerifyCode(emailAddr);
        setSent(true);
        setStep('verify');
      } catch (err: any) {
        setError(err.status ? err : { status: 0, error: 'Error', message: err.message });
      } finally {
        setSendLoading(false);
      }
    },
    [setError]
  );

  useEffect(() => {
    if (emailFromUrl && step === 'email' && !autoSent.current) {
      autoSent.current = true;
      sendCode(emailFromUrl);
    }
  }, [emailFromUrl, step, sendCode]);

  const handleSendEmail = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email.trim()) return;
      await sendCode(email);
    },
    [email, sendCode]
  );

  return (
    <>
      {(loading || sendLoading) && (
        <LoadingOverlay message={step === 'email' ? 'Sending verification code...' : 'Verifying your email...'} />
      )}
      <ErrorPopup error={error} onClose={() => setError(null)} />
      <AuthCard>
        <AuthCardHeader
          eyebrow="Verification"
          title="Check your email"
          description="We've sent a 6-digit verification code to your email address. Enter it below to verify your account."
        />
        {step === 'email' ? (
          <form className="auth-form" onSubmit={handleSendEmail}>
            <AuthTextField
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={setEmail}
            />
            <AuthSubmitButton loading={sendLoading} loadingText="Sending...">
              Send verification code
            </AuthSubmitButton>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            {sent && (
              <SuccessBanner
                message="A verification code has been sent to your email."
                actionLabel="Resend"
                onAction={() => sendCode(email)}
                actionLoading={sendLoading}
              />
            )}
            <CodeInput
              value={values.otp}
              onChange={(v) => handleChange('otp', v)}
              error={errors.otp}
            />
            <AuthSubmitButton loading={loading} loadingText="Verifying...">
              Verify email
            </AuthSubmitButton>
          </form>
        )}
        <div className="auth-card-footer">
          <p>
            Already verified? <Link to="/auth/login">Sign in</Link>
          </p>
        </div>
      </AuthCard>
    </>
  );
}
