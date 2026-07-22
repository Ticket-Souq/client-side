import { Badge, QRCode } from '../../../shared/components'
import type { TicketType } from '../types/ticket.types'
import styles from '../styles/tickets.module.css'

interface Props {
  type: TicketType
  tier: string
  tierVariant: 'yellow' | 'soft' | 'ink'
  row: string
  seat: string
  price: string
  ticketCode: string
}

export default function TicketCardItem({ type, tier, tierVariant, row, seat, price, ticketCode }: Props) {
  return (
    <div className={styles.ticketCardDetail}>
      <div className={styles.ticketArtBand}>
        <div className={styles.beam} />
        <div className={styles.beam} />
        <div className={styles.beam} />
      </div>
      <div className={styles.ticketBody}>
        <div className={styles.ticketLeft}>
          <Badge variant={tierVariant}>{tier}</Badge>
          {type === 'seat' ? (
            <>
              <span className={styles.ticketLabel}>Row</span>
              <span className={styles.ticketValue}>{row}</span>
              <span className={styles.ticketLabel}>Seat</span>
              <span className={styles.ticketValue}>{seat}</span>
            </>
          ) : (
            <>
              <span className={styles.ticketLabel}>Zone</span>
              <span className={styles.ticketValue}>{row}</span>
            </>
          )}
          <span className={styles.ticketLabel}>Price</span>
          <span className={styles.ticketValue}>{price}</span>
        </div>
        <div className={styles.ticketRight}>
          <QRCode code={ticketCode} />
          <span className={styles.ticketCode}>{ticketCode}</span>
        </div>
      </div>
      <div className={styles.ticketStubNotch}>
        <span className={styles.stubNotchTop} />
        <span className={styles.stubNotchBottom} />
      </div>
    </div>
  )
}
