import type { BadgeVariant, ButtonVariant, ButtonSize, Role } from './tokens'

export interface NavLink {
  label: string
  href: string
  active?: boolean
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
  role?: Role
  links: NavLink[]
  avatarInitials?: string
}

export interface FooterProps {
  tagline?: string
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


export interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
}


export interface AvatarProps {
  initials: string
  size?: 'sm' | 'md'
}

export interface QRCodeProps {
  value: string
  size?: number
  logo?: string
}

export interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  actions?: React.ReactNode
}
