import React from 'react'
import type { FeaturedEventProps } from '../../types'
import { Button } from '../../form/Button/Button'
import styles from './FeaturedEvent.module.css'

export const FeaturedEvent: React.FC<FeaturedEventProps> = ({
  title, meta, description, tag = 'Featured', ctaLabel = 'Get Tickets', href,
}) => {
  const inner = (
    <div className={styles.art}>
      <div className={styles.beam}></div>
      <div className={styles.beam}></div>
      <div className={styles.beam}></div>
      <div className={styles.content}>
        <span className={styles.tag}>{tag}</span>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.meta}>{meta}</p>
        <p className={styles.desc}>{description}</p>
        <Button variant="primary">{ctaLabel}</Button>
      </div>
    </div>
  )

  if (href) {
    return <a href={href} className={styles.featured}>{inner}</a>
  }

  return <div className={styles.featured}>{inner}</div>
}