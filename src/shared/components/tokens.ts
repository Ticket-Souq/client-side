export const tokens = {
  colors: {
    white: '#ffffff',
    ink: '#15150f',
    inkSoft: '#3c3b34',
    textSecondary: '#726f63',
    border: '#eae7dc',
    yellow: '#ffc629',
    yellowDeep: '#e0a600',
    yellowPale: '#fff6d9',
  },
  radius: {
    default: 14,
    hero: 20,
    pill: 999,
  },
  container: {
    maxWidth: 1320,
    padding: 36,
    paddingMobile: 24,
  },
  nav: {
    height: 84,
  },
  hero: {
    titleSize: 72,
    titleSizeMobile: 48,
    grid: '1fr 360px',
  },
  ecard: {
    width: 340,
    height: 230,
  },
  button: {
    height: 50,
    heightSm: 40,
    fontSize: 15,
    fontSizeSm: 14,
  },
  breakpoint: 860,
  transition: {
    fast: '150ms ease',
    overlay: '260ms cubic-bezier(0.22,1,0.36,1)',
  },
} as const

export type TokenColor = keyof typeof tokens.colors
export type ArtVariant = 'waves' | 'beams' | 'grid' | 'confetti' | 'dots' | 'arc'
export type BadgeVariant = 'yellow' | 'ink' | 'soft' | 'green' | 'red' | 'orange'
export type ButtonVariant = 'primary' | 'ghost' | 'danger'
export type ButtonSize = 'default' | 'sm'
export type SeatStatus = 'avail' | 'locked' | 'taken' | 'accessible'
export type ZoneStatus = 'available' | 'selected' | 'limited' | 'soldout'
export type Role = 'customer' | 'organizer' | 'admin'