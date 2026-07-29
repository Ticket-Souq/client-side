import React from 'react'
import { useLocation } from 'react-router-dom'
import { Header } from './Header/Header'
import { Footer } from './Footer/Footer'
import { getUserRoles } from '../../auth'
import type { NavLink } from '../types'

function normaliseRole(raw: string): string {
  return raw.replace(/^ROLE_/, '').toLowerCase()
}

const TAGLINES: Record<string, string> = {
  customer: 'Made for events across Egypt',
  admin: 'Platform control center',
  org_head: 'Your events, your way',
  org_agent: 'Your events, your way',
  org_consumer: 'Your events, your way',
}

interface LayoutShellProps {
  navLinks?: NavLink[]
  children: React.ReactNode
}

export const LayoutShell: React.FC<LayoutShellProps> = ({ navLinks = [], children }) => {
  const location = useLocation()
  const roles = getUserRoles()
  const primaryRole = roles.length > 0 ? normaliseRole(roles[0]) : 'customer'
  const resolvedLinks = navLinks.length > 0 ? navLinks : undefined
  const links = resolvedLinks
    ? resolvedLinks.map((l) => ({ ...l, active: location.pathname === l.href }))
    : []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header links={links} />
      <main style={{ flex: 1 }}>
        {children}
      </main>
      <Footer tagline={TAGLINES[primaryRole] || TAGLINES.customer} />
    </div>
  )
}
