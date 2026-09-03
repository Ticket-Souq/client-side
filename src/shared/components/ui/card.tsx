import * as React from 'react'
import './card.css'

type DivProps = React.HTMLAttributes<HTMLDivElement>

export function Card({ className, ...props }: DivProps) {
  return <div className={['ui-card', className].filter(Boolean).join(' ')} {...props} />
}

export function CardHeader({ className, ...props }: DivProps) {
  return <div className={['ui-card-header', className].filter(Boolean).join(' ')} {...props} />
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={['ui-card-title', className].filter(Boolean).join(' ')} {...props} />
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={['ui-card-desc', className].filter(Boolean).join(' ')} {...props} />
}

export function CardContent({ className, ...props }: DivProps) {
  return <div className={['ui-card-content', className].filter(Boolean).join(' ')} {...props} />
}
