import React from 'react'
import type { EventCardProps } from '../../types'
import { ArtPattern } from '../../display/ArtPattern/ArtPattern'
import { Badge } from '../../display/Badge/Badge'
import { Button } from '../../form/Button/Button'
import styles from './EventCard.module.css'

export const EventCard: React.FC<EventCardProps> = ({
  variant, title, meta, artVariant = 'waves', cornerLabel,
  href, category, price, ctaLabel, onCtaClick,
}) => {
  if (variant === 'scroll') {
    const inner = (
      <>
        <div className={styles.artWrap}>
          <ArtPattern variant={artVariant} />
        </div>
        {cornerLabel && <span className={styles.corner}>{cornerLabel}</span>}
        <div className={styles.overlay}>
          <p className={styles.evTitle}>{title}</p>
          <p className={styles.evMeta}>{meta}</p>
        </div>
      </>
    )

    if (href) {
      return <a href={href} className={styles.scrollCard}>{inner}</a>
    }
    return <div className={styles.scrollCard}>{inner}</div>
  }

  return (
    <div className={styles.gridCard}>
      <div style={{ height: 120, borderRadius: '14px 14px 0 0', overflow: 'hidden', position: 'relative' }}>
        <ArtPattern variant={artVariant} />
      </div>
      <div className={styles.gridBody}>
        {category && <Badge variant="ink">{category}</Badge>}
        <h3 className={styles.gridTitle}>{title}</h3>
        <p className={styles.gridMeta}>{meta}</p>
        {price && <p className={styles.gridPrice}>{price}</p>}
        {ctaLabel && (
          <Button
            variant="primary"
            size="sm"
            style={{ width: '100%' }}
            href={href}
            onClick={onCtaClick}
          >
            {ctaLabel}
          </Button>
        )}
      </div>
    </div>
  )
}