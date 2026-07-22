import React from 'react'
import type { ArtPatternProps } from '../../types'
import type { ArtVariant } from '../../tokens'
import styles from './ArtPattern.module.css'

const variantMap: Record<ArtVariant, string> = {
  waves: styles.waves,
  beams: styles.beams,
  grid: styles.grid,
  confetti: styles.confetti,
  dots: styles.dots,
  arc: styles.arc,
}

export const ArtPattern: React.FC<ArtPatternProps> = ({ variant, className, style }) => {
  return (
    <div
      className={`${styles.art} ${variantMap[variant]}${className ? ' ' + className : ''}`}
      style={style}
    />
  )
}