import { useState, useCallback, type FormEvent } from 'react';
import { validate } from '../../../shared/validation';
import type { FieldRule } from '../../../shared/validation';
import { parseError, type ErrorData } from '../../../shared/apiError';

interface FieldConfig {
  name: string;
  initialValue?: string;
  rules: FieldRule;
}

interface UseAuthFormOptions {
  fields: FieldConfig[];
  onSubmit: (values: Record<string, string>) => Promise<void>;
}

interface UseAuthFormReturn {
  values: Record<string, string>;
  errors: Record<string, string | null>;
  touched: Record<string, boolean>;
  handleChange: (name: string, value: string) => void;
  handleBlur: (name: string) => void;
  handleSubmit: (e: FormEvent) => void;
  loading: boolean;
  error: ErrorData | null;
  setError: (error: ErrorData | null) => void;
}

export function useAuthForm({ fields, onSubmit }: UseAuthFormOptions): UseAuthFormReturn {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const f of fields) {
      initial[f.name] = f.initialValue ?? '';
    }
    return initial;
  });

  const [touched, setTouched] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const f of fields) {
      initial[f.name] = false;
    }
    return initial;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorData | null>(null);

  const errors: Record<string, string | null> = {};
  for (const f of fields) {
    errors[f.name] = touched[f.name] ? validate(values[f.name], f.rules) : null;
  }

  const handleChange = useCallback((name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => {
      if (prev[name]) return prev;
      return { ...prev, [name]: true };
    });
  }, []);

  const handleBlur = useCallback((name: string) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
  }, []);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      // Force all fields touched
      const allTouched: Record<string, boolean> = {};
      for (const f of fields) {
        allTouched[f.name] = true;
      }
      setTouched(allTouched);

      // Validate all fields
      for (const f of fields) {
        if (validate(values[f.name], f.rules)) return;
      }

      setError(null);
      setLoading(true);
      try {
        await onSubmit(values);
      } catch (err: any) {
        setError(err.status ? err : { status: 0, error: 'Error', message: err.message });
        setLoading(false);
      }
    },
    [fields, values, onSubmit]
  );

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    loading,
    error,
    setError,
  };
}
