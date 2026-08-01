import React from 'react'
import { QRCodeSVG } from 'qrcode.react'
import type { QRCodeProps } from '../../types'
import styles from './QRCode.module.css'

const DEFAULT_LOGO = '/Logo.png'
const BOX_RATIO = 0.30
const IMG_RATIO = 0.22

export const QRCode: React.FC<QRCodeProps> = ({ value, size = 250, logo = DEFAULT_LOGO }) => {
  const boxSize = Math.round(size * BOX_RATIO)
  const imgSize = Math.round(size * IMG_RATIO)
  return (
    <div className={styles.qr} style={{ width: size, height: size }}>
      <QRCodeSVG
        value={value}
        size={size}
        level="H"
        marginSize = {4}
        fgColor="#15150f"
        bgColor="#ffffff"
        title={value}
      />
      {logo && (
        <div className={styles.logoBox} style={{ width: boxSize, height: boxSize }}>
          <img src={logo} alt="" style={{ width: imgSize, height: imgSize }} />
        </div>
      )}
    </div>
  )
}
