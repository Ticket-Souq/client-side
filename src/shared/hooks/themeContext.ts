import { createContext, useContext } from 'react'
import type { ThemeMode } from '../theme'

export const STORAGE_KEY = 'ticketsouq-theme'

export interface ThemeCtx {
  mode: ThemeMode;
  toggleTheme: () => void;
  setMode: (mode: ThemeMode) => void;
}

export const ThemeContext = createContext<ThemeCtx>({ mode: 'light', toggleTheme: () => {}, setMode: () => {} });

export function getInitialMode(): ThemeMode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  } catch { /* ignore */ }
  return 'light';
}

export function useTheme(): ThemeCtx {
  return useContext(ThemeContext);
}
