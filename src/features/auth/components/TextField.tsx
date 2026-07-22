import {errorStyle, normalStyle} from "../../../shared/validation.ts";


interface Props {
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string | null;
}

export default function TextField({ label, type = "text", placeholder, value, onChange, onBlur, error }: Props) {
  return (
    <div className="mb-3">
      <label
        className="form-label mb-1"
        style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-text)" }}
      >
        {label}
      </label>
      <input
        type={type}
        className="form-control"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        style={error ? errorStyle : normalStyle}
      />
      {error && (
        <div style={{ fontSize: "12px", color: "#DC2626", marginTop: "4px" }}>{error}</div>
      )}
    </div>
  );
}
