import type { ReactNode } from 'react';

interface Props {
  loading: boolean;
  loadingText: string;
  children: ReactNode;
  disabled?: boolean;
}

export default function AuthSubmitButton({ loading, loadingText, children, disabled }: Props) {
  return (
    <button
      type="submit"
      className="auth-submit"
      disabled={loading || disabled}
    >
      {loading ? loadingText : children}
    </button>
  );
}
