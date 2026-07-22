import React from 'react'
import type { SidebarProps } from '../../types'

const sidebarStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 28,
  position: 'sticky',
  top: 100,
}

export const Sidebar: React.FC<SidebarProps> = ({ children, className }) => {
  return (
    <div style={sidebarStyle} className={className}>
      {children}
    </div>
  )
}