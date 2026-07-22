import React from 'react'
import type { QuantityStepperProps } from '../../types'
import styles from './QuantityStepper.module.css'

export const QuantityStepper: React.FC<QuantityStepperProps> = ({
  value, min = 1, max = 10, onChange,
}) => {
  return (
    <div className={styles.qtyRow}>
      <span className={styles.label}>Quantity</span>
      <div className={styles.controls}>
        <button
          className={styles.btn}
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
        >&minus;</button>
        <span className={styles.value}>{value}</span>
        <button
          className={styles.btn}
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
        >+</button>
      </div>
    </div>
  )
}