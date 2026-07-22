import React from 'react'
import type { SeatMapProps } from '../../types'
import type { SeatStatus } from '../../tokens'
import styles from './SeatMap.module.css'

const statusMap: Record<SeatStatus, string> = {
  avail: styles.avail,
  locked: styles.locked,
  taken: styles.taken,
  accessible: styles.accessible,
}

export const SeatMap: React.FC<SeatMapProps> = ({ rows }) => {
  return (
    <div className={styles.wrap}>
      <div className={styles.stage}>STAGE</div>
      <div className={styles.map}>
        {rows.map((row) => (
          <React.Fragment key={row.label}>
            <span className={styles.label}>{row.label}</span>
            {row.seats.map((status, i) => (
              <span
                key={i}
                className={`${styles.dot} ${statusMap[status]}`}
              />
            ))}
          </React.Fragment>
        ))}
      </div>
      <div className={styles.legend}>
        <span className={styles.legendItem}>
          <span className={`${styles.dot} ${styles.avail}`} style={{ cursor: 'default' }}></span> Available
        </span>
        <span className={styles.legendItem}>
          <span className={`${styles.dot} ${styles.locked}`} style={{ cursor: 'default' }}></span> Selected
        </span>
        <span className={styles.legendItem}>
          <span className={`${styles.dot} ${styles.taken}`} style={{ cursor: 'default' }}></span> Taken
        </span>
        <span className={styles.legendItem}>
          <span className={`${styles.dot} ${styles.accessible}`} style={{ cursor: 'default' }}></span> Accessible
        </span>
      </div>
    </div>
  )
}