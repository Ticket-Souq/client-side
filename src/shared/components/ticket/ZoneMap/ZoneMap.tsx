import React from 'react'
import type { ZoneMapProps, ZoneData } from '../../types'
import styles from './ZoneMap.module.css'

const ZoneBlock: React.FC<{
  zone: ZoneData
  isSelected: boolean
  onSelect: (id: string) => void
}> = ({ zone, isSelected, onSelect }) => {
  const classes = [
    styles.zone,
    isSelected ? styles.selected : '',
    zone.status === 'limited' ? styles.limited : '',
    zone.status === 'soldout' ? styles.soldout : '',
    zone.id === 'vip' ? styles.wide : '',
  ].filter(Boolean).join(' ')

  return (
    <div
      className={classes}
      onClick={() => zone.status !== 'soldout' && onSelect(zone.id)}
    >
      <span className={styles.label}>{zone.label}</span>
      <span className={styles.seats}>{zone.spots} spots</span>
    </div>
  )
}

export const ZoneMap: React.FC<ZoneMapProps> = ({ zones, selectedZone, onZoneSelect }) => {
  return (
    <div className={styles.mapWrap}>
      <div className={styles.stage}>STAGE</div>
      <div className={styles.grid}>
        {zones.map((zone) => (
          <ZoneBlock
            key={zone.id}
            zone={zone}
            isSelected={zone.id === selectedZone}
            onSelect={onZoneSelect}
          />
        ))}
      </div>
      <div className={styles.legend}>
        <span className={styles.legendItem}>
          <span className={`${styles.dot} ${styles.dotAvailable}`}></span> Available
        </span>
        <span className={styles.legendItem}>
          <span className={`${styles.dot} ${styles.dotSelected}`}></span> Selected
        </span>
        <span className={styles.legendItem}>
          <span className={`${styles.dot} ${styles.dotLimited}`}></span> Limited
        </span>
        <span className={styles.legendItem}>
          <span className={`${styles.dot} ${styles.dotSoldout}`}></span> Sold out
        </span>
      </div>
    </div>
  )
}