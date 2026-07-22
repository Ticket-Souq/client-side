interface Props {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

export default function AuthToggle({ checked, onChange, label }: Props) {
  return (
    <label
      className={`auth-toggle${checked ? ' active' : ''}`}
      onClick={() => onChange(!checked)}
    >
      <span className="auth-toggle-track" />
      {label}
    </label>
  );
}
