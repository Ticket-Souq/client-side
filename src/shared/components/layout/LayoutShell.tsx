import React from 'react'
import { useLocation } from 'react-router-dom'
import { Header } from './Header/Header'
import { Footer } from './Footer/Footer'
import { getUserRoles } from '../../auth'
import type { NavLink } from '../types'

function normaliseRole(raw: string): string {
  return raw.replace(/^ROLE_/, '').toLowerCase()
}

const FOOTER_COLS: Record<string, { title: string; links: { label: string; href: string }[] }[]> = {
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
  org_head: [
    {
      title: 'Manage',
      links: [
        { label: 'Events', href: '/org/events' },
        { label: 'Venues', href: '/org/venues' },
        { label: 'Organization', href: '/org/organization' },
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

  const footerKey = primaryRole.startsWith('org_') ? 'org_head' : primaryRole

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header links={links} />
      <main style={{ flex: 1 }}>
        {children}
      </main>
      <Footer columns={FOOTER_COLS[footerKey] || FOOTER_COLS.customer} tagline={TAGLINES[primaryRole] || TAGLINES.customer} />
    </div>
  )
}
