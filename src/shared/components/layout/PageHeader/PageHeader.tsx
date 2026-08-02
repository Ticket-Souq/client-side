import type { CSSProperties, ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  actions?: ReactNode
  className?: string
  style?: CSSProperties
}

export function PageHeader({ title, subtitle, actions, className = 'page-head', style }: PageHeaderProps) {
  return (
    <div className={className} style={style}>
      <div>
        <h1 className="section-title" style={{ margin: 0 }}>{title}</h1>
        {subtitle && <p className="section-sub" style={{ margin: '4px 0 0' }}>{subtitle}</p>}
      </div>
      {actions && <div className="page-head-actions">{actions}</div>}
    </div>
  )
}
