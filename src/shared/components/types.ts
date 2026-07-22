import type { ArtVariant, BadgeVariant, ButtonVariant, ButtonSize, SeatStatus, ZoneStatus, Role } from './tokens'

export interface NavLink {
  label: string
  href: string
  active?: boolean
}

export interface TicketHeroProps {
  title: string
  date: string
  venue: string
  tag?: string
  price: string
  category?: string
  duration?: string
  ctaLabel?: string
  onCtaClick?: () => void
  artVariant?: ArtVariant
}

export interface TicketCardProps {
  tier: string
  tierVariant?: BadgeVariant
  row: string
  seat: string
  price: string
  ticketCode: string
}

export interface OrderHeroProps {
  title: string
  date: string
  venue: string
  price: string
  items: { label: string; value: string }[]
  ctaLabel?: string
  onCtaClick?: () => void
}

export interface EventCardProps {
  variant: 'scroll' | 'grid'
  title: string
  meta: string
  artVariant?: ArtVariant
  cornerLabel?: string
  href?: string
  category?: string
  price?: string
  ctaLabel?: string
  onCtaClick?: () => void
}

export interface FeaturedEventProps {
  title: string
  meta: string
  description: string
  tag?: string
  ctaLabel?: string
  href?: string
}

export interface HeaderProps {
  role: Role
  links: NavLink[]
  avatarInitials?: string
}

export interface FooterProps {
  columns: FooterColumn[]
  tagline?: string
}

export interface FooterColumn {
  title: string
  links: { label: string; href: string }[]
}

export interface FilterBarProps {
  children?: React.ReactNode
}

export interface HorizontalScrollProps {
  children: React.ReactNode
}

export interface ButtonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  href?: string
  className?: string
  style?: React.CSSProperties
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  title?: string
  type?: 'button' | 'submit'
}

export interface InputProps {
  type?: string
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  className?: string
  style?: React.CSSProperties
}

export interface SelectProps {
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void
  className?: string
  children: React.ReactNode
}

export interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
}

export interface CardProps {
  className?: string
  children: React.ReactNode
  style?: React.CSSProperties
}

export interface TableProps {
  headers: string[]
  rows: (string | React.ReactNode)[][]
}

export interface ArtPatternProps {
  variant: ArtVariant
  className?: string
  style?: React.CSSProperties
}

export interface AvatarProps {
  initials: string
  size?: 'sm' | 'md'
}

export interface QRCodeProps {
  code: string
}

export interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  actions?: React.ReactNode
}

export interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
}

export interface QuantityStepperProps {
  value: number
  min?: number
  max?: number
  onChange: (value: number) => void
}

export interface CountdownProps {
  seconds: number
  onExpire?: () => void
}

export interface ZoneMapProps {
  zones: ZoneData[]
  selectedZone: string | null
  onZoneSelect: (zoneId: string) => void
}

export interface ZoneData {
  id: string
  label: string
  spots: number
  price: number
  status: ZoneStatus
}

export interface SeatMapProps {
  rows: SeatRow[]
}

export interface SeatRow {
  label: string
  seats: SeatStatus[]
}

export interface SidebarProps {
  children: React.ReactNode
  className?: string
}