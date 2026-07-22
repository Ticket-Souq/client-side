import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export default function AuthCard({ children }: Props) {
  return (
    <div className="auth-card">
      {children}
    </div>
  );
}
