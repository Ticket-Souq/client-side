import React from 'react'
import type { TicketCardProps } from '../../types'
import type { BadgeVariant } from '../../tokens'
import { Badge } from '../../display/Badge/Badge'
import { QRCode } from '../../display/QRCode/QRCode'
import styles from './TicketCard.module.css'

const tierMap: Record<string, BadgeVariant> = {
  VIP: 'yellow',
  Regular: 'ink',
  Balcony: 'yellow',
}

export const TicketCard: React.FC<TicketCardProps> = ({
  tier, tierVariant, row, seat, price, ticketCode,
}) => {
  const badgeVariant = tierVariant || tierMap[tier] || 'ink'

  return (
    <div className={styles.card}>
      <div className={styles.band}>
        <div className={styles.beam}></div>
        <div className={styles.beam}></div>
        <div className={styles.beam}></div>
      </div>
      <div className={styles.body}>
        <div className={styles.left}>
          <Badge variant={badgeVariant}>{tier}</Badge>
          <span className={`${styles.label} ${styles.labelFirst}`}>Row</span>
          <span className={styles.value}>{row}</span>
          <span className={styles.label}>Seat</span>
          <span className={styles.value}>{seat}</span>
          <span className={styles.label}>Price</span>
          <span className={styles.value}>{price}</span>
        </div>
        <div className={styles.right}>
          <QRCode value={ticketCode} />
          <span className={styles.code}>{ticketCode}</span>
        </div>
      </div>
      <div className={styles.notches}>
        <span className={styles.notch}></span>
        <span className={`${styles.notch} ${styles.notchBot}`}></span>
      </div>
    </div>
  )
}