import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useEvent } from '../hooks/useEvent'
import { LoadingSkeleton } from '../components/LoadingSkeleton'
import { SeatMapPreview } from '../../../shared/components/seatmap/SeatMapPreview'
import type { SeatReservation } from '../../../shared/components/seatmap/SeatMapPreview'
import type { SeatMap } from '../../venues/components/types'
import { getTemplateById } from '../../venues/api/venueApi'
import { formatEventDate, formatPrice } from '../../../shared/format'
import { releaseLocks, acquireSeatLocks, acquireZoneLock } from '../services/lockApi'
import { toast } from '../../../shared/components/display/Toast/Toast'
import { loadReservation, saveReservation, clearReservation, parseExpiresAt } from '../../../shared/booking/reservationStorage'
import { request } from '../../../shared/http'
import { API } from '../../../shared/api'
import { isAuthenticated } from '../../../shared/auth'

const MAX_TICKETS = 10;

interface SelectedTicket {
  key: string
  templateCellId: string
  label: string
  sectionName: string
  price: number
  sectionId: string
}

export default function EventReserve() {
  const { eventId } = useParams<{ eventId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { event, loading, error } = useEvent(eventId ?? null)
  const [templateMap, setTemplateMap] = useState<SeatMap | null>(null)
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [selectedSeats, setSelectedSeats] = useState<SelectedTicket[]>([])
  const [holderNames, setHolderNames] = useState<Record<string, string>>({})
  const [hasActiveReservation, setHasActiveReservation] = useState<{ reservationId: string } | null>(() => {
    const stored = loadReservation()
    if (stored?.tickets?.length) {
      const expiresMs = parseExpiresAt(stored.expiresAt)
      if (expiresMs > Date.now()) return { reservationId: stored.reservationId }
    }
    return null
  })
  const [hasTicketsInEvent, setHasTicketsInEvent] = useState(false)
  const [releasing, setReleasing] = useState(false)
  const [locking, setLocking] = useState(false)

  useEffect(() => {
    if (!event?.venueTemplateId || event.bookingModel !== 'SEAT') return
    ;(async () => {
      try {
        const tpl = await getTemplateById(event.venueTemplateId!)
        setTemplateMap(JSON.parse(tpl.layout) as SeatMap)
      } catch { /* ignore */ }
    })()
  }, [event?.venueTemplateId, event?.bookingModel])

  useEffect(() => {
    if (!event?.id) return
    let cancelled = false
    ;(async () => {
      try {
        const tickets = await request<{ eventId?: string; reservationStatus?: string }[]>(API.tickets.list)
        if (cancelled) return
        setHasTicketsInEvent(tickets.some((t) => t.eventId === event.id && t.reservationStatus === 'ACTIVE'))
      } catch { /* ignore */ }
    })()
    return () => { cancelled = true }
  }, [event?.id])

  const isZone = event?.bookingModel === 'ZONE'
  const sections = useMemo(() => event?.sections ?? [], [event?.sections])

  // -- Zone: section quantities --
  const zoneTickets = useMemo(() => {
    if (!isZone) return []
    const result: SelectedTicket[] = []
    for (const section of sections) {
      const qty = quantities[section.id] ?? 0
      for (let i = 0; i < qty; i++) {
        result.push({ key: section.id + '_' + i, templateCellId: '', label: section.name, sectionName: section.name, price: Number(section.price ?? 0), sectionId: section.id })
      }
    }
    return result
  }, [isZone, sections, quantities])

  // -- Seat: section price map --
  const sectionPriceMap = useMemo(() => {
    if (!templateMap || !sections) return new Map<string, { sectionName: string; price: number; color: string }>()
    const map = new Map<string, { sectionName: string; price: number; color: string }>()
    for (const category of templateMap.categories) {
      const section = sections.find((s) => s.templateSectionId === category.id || s.color === category.color)
      if (section) {
        map.set(category.id, { sectionName: section.name, price: Number(section.price ?? 0), color: category.color })
      }
    }
    for (const row of templateMap.rows) {
      for (const cell of row.cells) {
        if (cell.categoryId && map.has(cell.categoryId)) {
          map.set(cell.id, map.get(cell.categoryId)!)
        }
      }
    }
    return map
  }, [templateMap, sections])

  const reservations: SeatReservation[] = useMemo(() => {
    if (!sections || isZone) return []
    const result: SeatReservation[] = []
    for (const sec of sections) {
      for (const seat of sec.seats) {
        if (seat.status !== 'AVAILABLE' && seat.id) {
          result.push({ cellId: seat.templateSeatId ?? seat.id, rowLabel: '', seatNumber: '', holderName: '' })
        }
      }
    }
    return result
  }, [sections, isZone])

  const templateToEventSeatMap = useMemo(() => {
    const map = new Map<string, { eventSeatId: string; sectionId: string }>()
    for (const sec of sections) {
      for (const seat of sec.seats) {
        if (seat.templateSeatId && seat.id) {
          map.set(String(seat.templateSeatId), { eventSeatId: String(seat.id), sectionId: String(sec.id) })
        }
      }
    }
    return map
  }, [sections])

  const selectedCellIds = useMemo(() => new Set(selectedSeats.map((s) => s.templateCellId).filter(Boolean)), [selectedSeats])

  const handleSeatSelect = useCallback((cellId: string, rowLabel: string, seatNumber: string) => {
    const mapped = templateToEventSeatMap.get(cellId)
    const eventSeatId = mapped?.eventSeatId ?? cellId
    const sectionId = mapped?.sectionId ?? ''
    setSelectedSeats((prev) => {
      const idx = prev.findIndex((s) => s.key === eventSeatId)
      if (idx !== -1) {
        const updated = prev.slice(0, idx)
        setHolderNames((names) => {
          const next = { ...names }
          delete next[eventSeatId]
          return next
        })
        return updated
      }
      if (prev.length >= MAX_TICKETS) return prev
      const info = sectionPriceMap.get(cellId)
      return [...prev, { key: eventSeatId, templateCellId: cellId, label: `${rowLabel}${seatNumber}`, sectionName: info?.sectionName ?? '', price: info?.price ?? 0, sectionId }]
    })
  }, [sectionPriceMap, templateToEventSeatMap])

  const updateQty = (sectionId: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[sectionId] ?? 0
      const next = current + delta
      if (next < 0) return prev
      const section = sections.find((s) => s.id === sectionId)
      const max = Math.min(section?.remainingCapacity ?? section?.capacity ?? 0, MAX_TICKETS)
      if (next > max) return prev
      return { ...prev, [sectionId]: next }
    })
  }

  const activeZoneId = Object.keys(quantities).find((id) => (quantities[id] ?? 0) > 0)

  const selectedTickets = isZone ? zoneTickets : selectedSeats
  const totalPrice = useMemo(() => selectedTickets.reduce((sum, t) => sum + t.price, 0), [selectedTickets])
  const totalTickets = selectedTickets.length

  const allGuests = hasTicketsInEvent
  const canProceed = totalTickets > 0 &&
    selectedTickets.every((t, i) => (!allGuests && i === 0) || (holderNames[t.key]?.trim() ?? '') !== '')

  const proceedToCheckout = async () => {
    if (!canProceed || locking || !event) return
    if (!isAuthenticated()) {
      navigate('/auth/login', { state: { from: location.pathname } })
      return
    }
    if (totalTickets > MAX_TICKETS) {
      toast(`A maximum of ${MAX_TICKETS} tickets per reservation`, 'error')
      return
    }
    setLocking(true)
    try {
      let resp: { reservationId: string; expiresAt: string }
      if (isZone) {
        resp = await acquireZoneLock(event.id, selectedTickets[0].sectionId, selectedTickets.length)
      } else {
        resp = await acquireSeatLocks(event.id, selectedTickets.map((t) => t.key))
      }
      saveReservation({
        reservationId: resp.reservationId,
        eventId: event.id,
        bookingModel: event.bookingModel,
        seatIds: selectedTickets.map((t) => t.key),
        expiresAt: resp.expiresAt,
        tickets: selectedTickets,
        holderNames,
      })
      navigate('/customer/booking/checkout', {
        state: {
          reservationId: resp.reservationId,
          tickets: selectedTickets,
          eventId: event.id,
          bookingModel: event.bookingModel,
          holderNames,
        },
      })
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to lock selection', 'error')
    } finally {
      setLocking(false)
    }
  }

  if (loading) {
    return (
      <div className="wrap zone-page">
        <LoadingSkeleton variant="card" count={1} />
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="wrap zone-page">
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <h2>Event not found</h2>
          <button className="btn btn-accent mt-3" onClick={() => navigate('/')}>&larr; Back to events</button>
        </div>
      </div>
    )
  }

  if (hasActiveReservation) {
    return (
      <main className="wrap zone-page" style={{ paddingTop: 40 }}>
        <div style={{ textAlign: 'center', maxWidth: 480, margin: '0 auto', padding: 40, background: 'var(--warning-soft)', borderRadius: 12, border: '1px solid var(--warning-bright)' }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Active reservation found</h2>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20 }}>
            You already have an active reservation. Please complete your payment or cancel it before making a new selection.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button className="btn btn-primary" style={{ border: 'none', cursor: 'pointer' }} onClick={() => navigate('/customer/reservations')}>
              View My Reservations
            </button>
            <button
              className="btn btn-ghost"
              disabled={releasing}
              style={{ border: 'none', cursor: releasing ? 'not-allowed' : 'pointer' }}
              onClick={async () => {
                setReleasing(true)
                try { await releaseLocks(hasActiveReservation.reservationId) } catch { /* ignore */ }
                clearReservation()
                setHasActiveReservation(null)
                setReleasing(false)
              }}
            >
              {releasing ? 'Releasing...' : 'Cancel & Start New'}
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="wrap zone-page">
      <button
        onClick={() => navigate(`/events/${event.id}`)}
        className="btn btn-ghost btn-sm back-link"
        style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
      >
        &larr; Back to event
      </button>

      <section className="page-head">
        <h1 className="page-title display">{isZone ? 'Select Your Zone' : 'Select Your Seat'}</h1>
        <p className="section-sub" style={{ margin: '4px 0 0' }}>
          {event.title} &middot; {formatEventDate(event.startDate, event.finishDate)} &middot; {event.location || 'TBD'}
        </p>
        <p style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--text-secondary)' }}>
          {isZone
            ? 'You can select tickets from only one zone · up to '
            : 'Up to '}
          {MAX_TICKETS} tickets per reservation
        </p>
      </section>

      <div className="events-zone-grid">
        {/* Left: seat map or zone sections */}
        <div>
          {isZone ? (
            sections.length === 0 ? (
              <div className="card-white" style={{ padding: 32, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 14 }}>
                No sections available
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {sections.map((section) => {
                  const qty = quantities[section.id] ?? 0
                  const max = section.remainingCapacity ?? section.capacity ?? 0
                  const otherDisabled = activeZoneId !== undefined && activeZoneId !== section.id
                  return (
                    <div key={section.id} className="card-white" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', opacity: otherDisabled ? 0.45 : 1 }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 600 }}>{section.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                          {Number(section.price ?? 0) > 0 ? formatPrice(Number(section.price)) : 'Free'}
                          {' · '}{max} available
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button
                          onClick={() => updateQty(section.id, -1)}
                          disabled={qty === 0}
                          style={{
                            width: 32, height: 32, borderRadius: 8, border: '1px solid var(--color-border)',
                            background: qty === 0 ? 'var(--surface-hover)' : 'var(--white)', cursor: qty === 0 ? 'not-allowed' : 'pointer',
                            fontSize: 18, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: qty === 0 ? 'var(--text-secondary)' : 'var(--ink)', fontFamily: 'inherit',
                          }}
                        >–</button>
                        <span style={{ fontSize: 18, fontWeight: 700, minWidth: 28, textAlign: 'center' }}>{qty}</span>
                        <button
                          onClick={() => updateQty(section.id, 1)}
                          disabled={qty >= max || otherDisabled || qty >= MAX_TICKETS}
                          title={otherDisabled ? 'Only one zone can be selected' : qty >= MAX_TICKETS ? `Maximum of ${MAX_TICKETS} tickets per reservation` : undefined}
                          style={{
                            width: 32, height: 32, borderRadius: 8, border: '1px solid var(--color-border)',
                            background: qty >= max || otherDisabled || qty >= MAX_TICKETS ? 'var(--surface-hover)' : 'var(--white)', cursor: qty >= max || otherDisabled || qty >= MAX_TICKETS ? 'not-allowed' : 'pointer',
                            fontSize: 18, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: qty >= max || otherDisabled || qty >= MAX_TICKETS ? 'var(--text-secondary)' : 'var(--ink)', fontFamily: 'inherit',
                          }}
                        >+</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          ) : templateMap ? (
            <>
              {selectedSeats.length >= MAX_TICKETS && (
                <div style={{ marginBottom: 12, padding: '8px 12px', borderRadius: 8, background: 'var(--warning-soft)', border: '1px solid var(--warning-bright)', fontSize: 12, color: 'var(--warning)' }}>
                  Maximum of {MAX_TICKETS} seats reached. Deselect a seat to pick another.
                </div>
              )}
              <SeatMapPreview map={templateMap} reservations={reservations} onSeatSelect={handleSeatSelect} selectedCellIds={selectedCellIds} cellSize={28} cellGap={4} />
            </>
          ) : (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 14 }}>
              Loading seat map...
            </div>
          )}
        </div>

        {/* Right: selection panel */}
        <div className="events-side-stack">
          {totalTickets > 0 ? (
            <div className="card-white" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>
                  {totalTickets} ticket{totalTickets > 1 ? 's' : ''} selected
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {selectedTickets.map((ticket, i) => (
                  <div key={ticket.key}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: allGuests || i > 0 ? 6 : 0 }}>
                      <span style={{ fontSize: 14, fontWeight: 600 }}>
                        {ticket.label} — {allGuests ? `Guest ${i + 1}` : i === 0 ? 'For you' : `Guest ${i}`}
                      </span>
                      {ticket.price > 0 && (
                        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{formatPrice(ticket.price)}</span>
                      )}
                    </div>
                    {ticket.sectionName && (
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 2 }}>{ticket.sectionName}</div>
                    )}
                    {(allGuests || i > 0) && (
                      <input
                        type="text"
                        placeholder="Enter holder name"
                        value={holderNames[ticket.key] ?? ''}
                        onChange={(e) => setHolderNames((prev) => ({ ...prev, [ticket.key]: e.target.value }))}
                        style={{
                          width: '100%', padding: '8px 12px', borderRadius: 8,
                          border: '1px solid var(--color-border)', fontSize: 13,
                          boxSizing: 'border-box', fontFamily: 'inherit',
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>

              {totalPrice > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, marginTop: 12, borderTop: '1px solid var(--color-border)' }}>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>Total</span>
                  <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-accent)' }}>{formatPrice(totalPrice)}</span>
                </div>
              )}

              <button
                className="btn btn-primary"
                style={{ width: '100%', border: 'none', cursor: canProceed && !locking ? 'pointer' : 'not-allowed', marginTop: 16, opacity: canProceed && !locking ? 1 : 0.5 }}
                disabled={!canProceed || locking}
                onClick={proceedToCheckout}
              >
                {locking ? 'Locking your selection...' : 'Proceed to Checkout'}
              </button>
            </div>
          ) : (
            <div className="card-white" style={{ padding: 20, color: 'var(--text-secondary)', textAlign: 'center', fontSize: 14 }}>
              {isZone ? 'Select tickets above' : 'Click on a seat to select it'}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}