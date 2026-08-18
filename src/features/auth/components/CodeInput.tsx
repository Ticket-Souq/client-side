import { useRef, useCallback } from 'react';

interface Props {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
}

export default function CodeInput({ length = 6, value, onChange, error }: Props) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = useCallback(
    (index: number, char: string) => {
      // Only allow digits
      if (char && !/^\d$/.test(char)) return;

      const digits = value.split('');
      while (digits.length < length) digits.push('');
      digits[index] = char;

      const newValue = digits.join('').slice(0, length);
      onChange(newValue);

      // Auto-advance to next input
      if (char && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [value, onChange, length]
  );

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent) => {
      if (e.key === 'Backspace' && !value[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    },
    [value]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault();
      const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
      if (pasted) {
        onChange(pasted);
        const focusIndex = Math.min(pasted.length, length - 1);
        inputRefs.current[focusIndex]?.focus();
      }
    },
    [onChange, length]
  );

  const digits = value.split('');
  while (digits.length < length) digits.push('');

  return (
    <div className="form-group">
      <div className="auth-code-inputs">
        {Array.from({ length }, (_, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            type="text"
            maxLength={1}
            placeholder="0"
            value={digits[i] || ''}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            className={error ? 'input-error' : ''}
          />
        ))}
      </div>
      {error && <div className="field-error" style={{ textAlign: 'center' }}>{error}</div>}
    </div>
  );
}
