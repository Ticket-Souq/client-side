export interface FieldRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  patternMessage?: string;
}

export function validate(value: string, rules: FieldRule): string | null {
  if (rules.required && !value.trim()) return "This field is required";
  if (rules.minLength && value.length < rules.minLength) return `Minimum ${rules.minLength} characters`;
  if (rules.maxLength && value.length > rules.maxLength) return `Maximum ${rules.maxLength} characters`;
  if (rules.pattern && !rules.pattern.test(value)) return rules.patternMessage ?? "Invalid format";
  return null;
}

export const errorStyle: React.CSSProperties = {
  border: "1px solid #DC2626",
  boxShadow: "0 0 0 3px rgba(220, 38, 38, 0.15)",
};

export const normalStyle: React.CSSProperties = {
  fontSize: "14px",
  borderRadius: "8px",
  border: "1px solid var(--color-border)",
  padding: "10px 12px",
};
