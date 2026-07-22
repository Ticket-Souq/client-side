import React from 'react'
import type { TicketHeroProps } from '../../types'
import { Button } from '../../form/Button/Button'
import styles from './TicketHero.module.css'

export const TicketHero: React.FC<TicketHeroProps> = ({
  title, date, venue, tag, price, category, duration, ctaLabel, onCtaClick,
}) => {
  return (
    <div className={styles.card}>
      <div className={styles.art}>
        <div className={styles.beam}></div>
        <div className={styles.beam}></div>
        <div className={styles.beam}></div>
        <div className={styles.content}>
          {tag && <span className={styles.tag}>{tag}</span>}
          <h1 className={styles.title}>{title}</h1>
          <div className={styles.meta}>
            <span>{date}</span>
            <span>{venue}</span>
          </div>
        </div>
      </div>
      <div className={styles.stub}>
        <span className={`${styles.notch} ${styles.notchTop}`}></span>
        <span className={`${styles.notch} ${styles.notchBot}`}></span>
        <div className={styles.stubRow}>
          <span className={styles.stubLabel}>From</span>
          <span className={styles.stubPrice}>{price}</span>
        </div>
        {category && (
          <div className={styles.stubRow}>
            <span className={styles.stubLabel}>Category</span>
            <span className={styles.stubValue}>{category}</span>
          </div>
        )}
        {duration && (
          <div className={styles.stubRow}>
            <span className={styles.stubLabel}>Duration</span>
            <span className={styles.stubValue}>{duration}</span>
          </div>
        )}
        {ctaLabel && (
          <Button variant="primary" className={styles.cta} onClick={onCtaClick}>
            {ctaLabel}
          </Button>
        )}
      </div>
    </div>
  )
}