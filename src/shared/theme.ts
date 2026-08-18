// Mirror of shared/theme.css — keep values in sync.
// Use these tokens in TS/JSX for values that need real hex
// (canvas/PDF drawing, chart arrays, etc.). For everything else
// prefer `var(--token)` so CSS remains the single source.

export type ThemeMode = 'light' | 'dark'

export const theme = {
  /* Surfaces */
  bg: "#F7F7F7",
  surface: "#FFFFFF",
  surfaceSoft: "#FAFAF7",
  surfaceMuted: "#F0EFE8",
  surfaceHover: "#F5F4EF",
  whiteHover: "#F8F7F4",

  /* Text */
  text: "#15150F",
  inkSoft: "#3C3B34",
  textSecondary: "#726F63",
  onDark: "#FFFFFF",

  /* Border */
  border: "#EAE7DC",

  /* Accent (brand gold) */
  accent: "#FFC629",
  accentHover: "#E0A600",
  accentPale: "#FFF6D9",
  accentDeep: "#E2A30F",
  accentLight: "#EBC681",
  heroGlow: "#F6D66A",
  accentBtnHover: "#C88D0C",

  /* Dark / Hero */
  inkDeep: "#1C1C14",
  inkBlack: "#0D0D09",
  inkSoftest: "#3A3626",
  heroBrown: "#4E3B28",
  heroBlue: "#496D7E",

  /* Feedback */
  danger: "#DC2626",
  dangerDeep: "#C62828",
  dangerSoft: "#FEF2F2",
  dangerBorder: "#FECACA",
  success: "#2E7D32",
  successSoft: "#E8F5E9",
  successBright: "#16A34A",
  warning: "#E65100",
  warningSoft: "#FFF3E0",
  warningBright: "#FF9800",
  info: "#3B82F6",
} as const

// Dark variant — mirror of `:root[data-theme='dark']` in shared/theme.css.
// Used for canvas/PDF/chart drawing that needs literal hex in dark mode.
export const darkTheme: { [K in keyof typeof theme]: string } = {
  bg: "#14130F",
  surface: "#1B1A15",
  surfaceSoft: "#201F19",
  surfaceMuted: "#292720",
  surfaceHover: "#2B2922",
  whiteHover: "#26241E",

  text: "#EFECE1",
  inkSoft: "#C9C4B4",
  textSecondary: "#A29D8D",
  onDark: "#FFFFFF",

  border: "#36342A",

  accent: "#FFC629",
  accentHover: "#E0A600",
  accentPale: "#3B3218",
  accentDeep: "#E2A30F",
  accentLight: "#D9A950",
  heroGlow: "#F6D66A",
  accentBtnHover: "#C88D0C",

  inkDeep: "#1C1C14",
  inkBlack: "#0D0D09",
  inkSoftest: "#3A3626",
  heroBrown: "#4E3B28",
  heroBlue: "#496D7E",

  danger: "#F87171",
  dangerDeep: "#EF4444",
  dangerSoft: "#2B1414",
  dangerBorder: "#6B1D1D",
  success: "#4ADE80",
  successSoft: "#142C18",
  successBright: "#22C55E",
  warning: "#FB923C",
  warningSoft: "#36220F",
  warningBright: "#FB923C",
  info: "#60A5FA",
} as const;
