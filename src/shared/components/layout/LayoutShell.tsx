import React from 'react'
import { useLocation } from 'react-router-dom'
import { Header } from './Header/Header'
import { Footer } from './Footer/Footer'
import type { NavLink } from '../types'
import type { Role } from '../tokens'

const FOOTER_COLS = {
  customer: [
    {
      title: 'Discover',
      links: [
        { label: 'Events', href: '/customer/events' },
        { label: 'Outlets', href: '/customer/outlets' },
        { label: 'Categories', href: '#' },
      ],
    },
    {
      title: 'Support',
      links: [
        { label: 'Contact us', href: '/customer/contact' },
        { label: 'Refunds', href: '/customer/refunds' },
        { label: 'FAQ', href: '#' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About', href: '#' },
        { label: 'Careers', href: '#' },
        { label: 'Terms & privacy', href: '#' },
      ],
    },
  ],
  organizer: [
    {
      title: 'Manage',
      links: [
        { label: 'Events', href: '/org/events' },
        { label: 'Venues', href: '/org/venues' },
        { label: 'Templates', href: '/org/venues' },
      ],
    },
    {
      title: 'Support',
      links: [
        { label: 'Contact us', href: '/customer/contact' },
        { label: 'FAQ', href: '#' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About', href: '#' },
        { label: 'Terms & privacy', href: '#' },
      ],
    },
  ],
  admin: [
    {
      title: 'Oversight',
      links: [
        { label: 'Events', href: '/admin/events' },
        { label: 'Venues', href: '/admin/venues' },
        { label: 'Organizations', href: '/admin/organizations' },
      ],
    },
    {
      title: 'System',
      links: [
        { label: 'Monitoring', href: '/admin/monitoring' },
        { label: 'Audit Logs', href: '/admin/logs' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About', href: '#' },
        { label: 'Terms & privacy', href: '#' },
      ],
    },
  ],
}

const TAGLINES: Record<string, string> = {
  customer: 'Made for events across Egypt',
  organizer: 'Your events, your way',
  admin: 'Platform control center',
}

interface LayoutShellProps {
  role: Role
  navLinks?: NavLink[]
  children: React.ReactNode
}

export const LayoutShell: React.FC<LayoutShellProps> = ({ role, navLinks = [], children }) => {
  const location = useLocation()
  const resolvedLinks = navLinks.length > 0 ? navLinks : undefined
  const links = resolvedLinks
    ? resolvedLinks.map((l) => ({ ...l, active: location.pathname === l.href }))
    : []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header role={role} links={links} />
      <main style={{ flex: 1 }}>
        {children}
      </main>
      <Footer columns={FOOTER_COLS[role as keyof typeof FOOTER_COLS] || FOOTER_COLS.customer} tagline={TAGLINES[role]} />
    </div>
  )
}
