import React from 'react'
import type { OrderHeroProps } from '../../types'
import { Button } from '../../form/Button/Button'
import styles from './OrderHero.module.css'

export const OrderHero: React.FC<OrderHeroProps> = ({
  title, date, venue, price, items, ctaLabel, onCtaClick,
}) => {
  return (
    <div className={styles.card}>
      <div className={styles.art}>
        <div className={styles.beam}></div>
        <div className={styles.beam}></div>
        <div className={styles.beam}></div>
        <div className={styles.content}>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.meta}>{date} &middot; {venue}</p>
        </div>
      </div>
      <div className={styles.stub}>
        <span className={`${styles.notch} ${styles.notchTop}`}></span>
        <span className={`${styles.notch} ${styles.notchBot}`}></span>
        {items.map((item, i) => (
          <div className={styles.stubRow} key={i}>
            <span className={styles.stubLabel}>{item.label}</span>
            <span className={styles.stubValue}>{item.value}</span>
          </div>
        ))}
        <div className={styles.total}>{price}</div>
        {ctaLabel && <Button variant="primary" className={styles.cta} onClick={onCtaClick}>{ctaLabel}</Button>}
      </div>
    </div>
  )
}