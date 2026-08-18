import type { AuthTabType } from '../types/auth.types';

interface Props {
  active: AuthTabType;
  onChange: (tab: AuthTabType) => void;
}

export default function AuthTabs({ active, onChange }: Props) {
  return (
    <div className="auth-tabs">
      <button
        type="button"
        className={`auth-tab${active === 'customer' ? ' active' : ''}`}
        onClick={() => onChange('customer')}
      >
        Customer
      </button>
      <button
        type="button"
        className={`auth-tab${active === 'organization' ? ' active' : ''}`}
        onClick={() => onChange('organization')}
      >
        Organization
      </button>
    </div>
  );
}
