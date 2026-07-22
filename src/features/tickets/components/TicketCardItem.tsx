import { Badge, QRCode } from '../../../shared/components'
import type { TicketResponse } from '../types/ticket.types'
import { deriveDisplayStatus, formatPrice } from '../types/ticket.types'
import TicketStatusBadge from './TicketStatusBadge'
import styles from '../styles/tickets.module.css'

interface Props {
  ticket: TicketResponse
}

export default function TicketCardItem({ ticket }: Props) {
  const isSeat = ticket.ticketType === 'SEAT'
  const tierLabel = isSeat ? ticket.seatCategory : ticket.zoneCategory
  const status = deriveDisplayStatus(ticket)

  return (
    <div className={styles.ticketCardDetail}>
      <div className={styles.ticketArtBand}>
        <div className={styles.beam} />
        <div className={styles.beam} />
        <div className={styles.beam} />
      </div>
      <div className={styles.ticketBody}>
        <div className={styles.ticketLeft}>
          <Badge variant="ink">{tierLabel ?? '—'}</Badge>
          {isSeat ? (
            <>
              <span className={styles.ticketLabel}>Row</span>
              <span className={styles.ticketValue}>{ticket.row}</span>
              <span className={styles.ticketLabel}>Seat</span>
              <span className={styles.ticketValue}>{ticket.seatNumber}</span>
            </>
          ) : (
            <>
              <span className={styles.ticketLabel}>Zone</span>
              <span className={styles.ticketValue}>{ticket.zoneCategory}</span>
            </>
          )}
          <span className={styles.ticketLabel}>Price</span>
          <span className={styles.ticketValue}>{formatPrice(ticket.price)}</span>
          <span className={styles.ticketLabel} style={{ marginTop: 8 }}>Status</span>
          <TicketStatusBadge status={status} />
        </div>
        <div className={styles.ticketRight}>
          <QRCode code={ticket.id} />
          <span className={styles.ticketCode}>{ticket.id.slice(0, 8).toUpperCase()}</span>
        </div>
      </div>
      <div className={styles.ticketStubNotch}>
        <span className={styles.stubNotchTop} />
        <span className={styles.stubNotchBottom} />
      </div>
    </div>
  )
}
