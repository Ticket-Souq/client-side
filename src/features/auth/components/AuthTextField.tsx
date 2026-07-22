interface Props {
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string | null;
  id?: string;
}

export default function AuthTextField({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  id,
}: Props) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="form-group">
      <label className="form-label" htmlFor={inputId}>
        {label}
      </label>
      <input
        id={inputId}
        type={type}
        className={`form-input${error ? ' input-error' : ''}`}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
      />
      {error && <div className="field-error">{error}</div>}
    </div>
  );
}
