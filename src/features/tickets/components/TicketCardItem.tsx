import { useEffect, useRef, useState } from 'react'
import { toPng } from 'html-to-image'
import { jsPDF } from 'jspdf'
import { Printer } from 'lucide-react'
import { Badge, Button, QRCode } from '../../../shared/components'
import { API } from '../../../shared/api'
import { EventApi } from '../../events/services/eventApi'
import type { TicketResponse } from '../types/ticket.types'
import { deriveDisplayStatus, formatPrice } from '../types/ticket.types'
import TicketStatusBadge from './TicketStatusBadge'
import styles from '../styles/tickets.module.css'

interface Props {
  ticket: TicketResponse
}

const bannerCache = new Map<string, string | null>()

function assetUrl(url: string | null | undefined): string | null {
  if (!url) return null
  return url.startsWith('http') ? url : `${API.base}${url}`
}

export default function TicketCardItem({ ticket }: Props) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [printing, setPrinting] = useState(false)
  const [banner, setBanner] = useState<string | null>(() =>
    assetUrl(bannerCache.get(ticket.eventId) ?? ticket.eventPosterUrl),
  )
  const isSeat = ticket.ticketType === 'SEAT'
  const tierLabel = isSeat ? ticket.seatCategory : ticket.zoneCategory
  const status = deriveDisplayStatus(ticket)

  useEffect(() => {
    if (bannerCache.has(ticket.eventId)) return
    let active = true
    EventApi.getById(ticket.eventId)
      .then((event) => {
        const url = assetUrl(event.bannerUrl ?? event.PosterUrl)
        bannerCache.set(ticket.eventId, url)
        if (active && url) setBanner(url)
      })
      .catch(() => {
        bannerCache.set(ticket.eventId, null)
      })
    return () => {
      active = false
    }
  }, [ticket.eventId])

  const handlePrint = async () => {
    const node = cardRef.current
    if (!node || printing) return
    setPrinting(true)
    try {
      const dataUrl = await toPng(node, {
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        cacheBust: true,
      })
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
      const ratio = node.offsetHeight / node.offsetWidth
      const maxW = 277
      const maxH = 190
      let w = maxW
      let h = maxW * ratio
      if (h > maxH) {
        h = maxH
        w = maxH / ratio
      }
      pdf.addImage(dataUrl, 'PNG', 10, 10, w, h)
      pdf.save(`ticket-${ticket.id.slice(0, 8).toUpperCase()}.pdf`)
    } finally {
      setPrinting(false)
    }
  }

  return (
    <div
      ref={cardRef}
      className={`${styles.ticketCardDetail}${printing ? ` ${styles.printing}` : ''}`}
    >
      {banner && (
        <div
          className={styles.ticketArtBg}
          style={{ backgroundImage: `url(${banner})` }}
        />
      )}
      <div className={styles.ticketBody}>
        <div className={styles.ticketLeft}>
          <Badge variant="ink">{tierLabel ?? '—'}</Badge>
          <span className={styles.ticketLabel}>Holder</span>
          <span className={styles.ticketValue}>{ticket.holderName || '—'}</span>
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
          <QRCode value={API.tickets.byId(ticket.id)} />
          <Button
            variant="ghost"
            size="sm"
            className={styles.printButton}
            onClick={handlePrint}
            disabled={printing}
          >
            {printing ? 'Preparing…' : 'Print it'}
            {!printing && <Printer size={14} />}
          </Button>
        </div>
      </div>
    </div>
  )
}
