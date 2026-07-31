import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useEvent } from '../hooks/useEvent'
import { LoadingSkeleton } from '../components/LoadingSkeleton'
import { EmptyState } from '../components/EmptyState'
import { formatEventDate, formatPrice } from '../utils/eventFormatters'

interface ZoneTicket {
  sectionId: string
  sectionName: string
  price: number
}

export default function ZonePurchase() {
  const { eventId } = useParams<{ eventId: string }>()
  const navigate = useNavigate()
  const { event, loading, error } = useEvent(eventId ?? null)
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [holderNames, setHolderNames] = useState<Record<string, string>>({})
  const [timeLeft, setTimeLeft] = useState(600)
  const [timedOut, setTimedOut] = useState(false)

  useEffect(() => {
    if (timedOut) return
    if (timeLeft <= 0) {
      setTimedOut(true)
      setQuantities({})
      return
    }
    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000)
    return () => clearInterval(id)
  }, [timeLeft, timedOut])

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  const sections = useMemo(() => event?.sections ?? [], [event?.sections])

  const selectedTickets = useMemo(() => {
    const result: ZoneTicket[] = []
    for (const section of sections) {
      const qty = quantities[section.id] ?? 0
      for (let i = 0; i < qty; i++) {
        result.push({ sectionId: section.id, sectionName: section.name, price: Number(section.price ?? 0) })
      }
    }
    return result
  }, [sections, quantities])

  const totalPrice = useMemo(() => selectedTickets.reduce((sum, t) => sum + t.price, 0), [selectedTickets])

  const totalTickets = selectedTickets.length

  const updateQty = (sectionId: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[sectionId] ?? 0
      const next = current + delta
      if (next < 0) return prev
      const section = sections.find((s) => s.id === sectionId)
      const max = section?.remainingCapacity ?? section?.capacity ?? 0
      if (next > max) return prev
      return { ...prev, [sectionId]: next }
    })
  }

  const canProceed = totalTickets === 0 ||
    selectedTickets.every((t, i) => i === 0 || (holderNames[t.sectionId + '_' + i]?.trim() ?? '') !== '')

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
        <EmptyState
          title="Event not found"
          description="This event doesn't exist or has been removed."
          actionLabel="Back to events"
          onAction={() => navigate('/')}
          icon="🎵"
        />
      </div>
    )
  }

  if (timedOut) {
    return (
      <main className="wrap zone-page" style={{ paddingTop: 40 }}>
        <div style={{ textAlign: 'center', padding: 40, background: '#fef2f2', borderRadius: 12, border: '1px solid #fecaca', maxWidth: 480, margin: '0 auto' }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#dc2626', margin: '0 0 8px' }}>Session expired</h2>
          <p style={{ fontSize: 14, color: '#726f63', margin: '0 0 16px' }}>Your time has run out. Please go back and try again.</p>
          <button className="btn btn-primary" style={{ border: 'none', cursor: 'pointer' }} onClick={() => navigate(`/events/${event.id}`)}>
            Back to event
          </button>
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
        <h1 className="page-title display">Select Your Zone</h1>
        <p className="section-sub" style={{ margin: '4px 0 0' }}>
          {event.title} &middot; {formatEventDate(event.startDate, event.finishDate)} &middot; {event.location || 'TBD'}
        </p>
      </section>

      <>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        padding: '10px 16px', marginBottom: 24, borderRadius: 8,
        background: timeLeft <= 120 ? '#fef2f2' : timeLeft <= 300 ? '#fffbeb' : '#f0fdf4',
        border: `1px solid ${timeLeft <= 120 ? '#fecaca' : timeLeft <= 300 ? '#fde68a' : '#bbf7d0'}`,
      }}>
        <span style={{ fontSize: 13, color: '#726f63' }}>Reservation lock</span>
        <span style={{
          fontSize: 22, fontWeight: 700, fontVariantNumeric: 'tabular-nums', letterSpacing: 1,
          color: timeLeft <= 120 ? '#dc2626' : timeLeft <= 300 ? '#d97706' : '#059669',
        }}>
          {formatTime(timeLeft)}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 32, alignItems: 'start' }}>
        <div>
          {sections.length === 0 ? (
            <div className="card-white" style={{ padding: 32, textAlign: 'center', color: '#726f63', fontSize: 14 }}>
              No sections available
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {sections.map((section) => {
                const qty = quantities[section.id] ?? 0
                const max = section.remainingCapacity ?? section.capacity ?? 0
                return (
                  <div key={section.id} className="card-white" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px' }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 600 }}>{section.name}</div>
                      <div style={{ fontSize: 12, color: '#726f63', marginTop: 2 }}>
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
                          background: qty === 0 ? '#f5f5f0' : '#fff', cursor: qty === 0 ? 'not-allowed' : 'pointer',
                          fontSize: 18, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: qty === 0 ? '#d1d5db' : '#1f1f1f', fontFamily: 'inherit',
                        }}
                      >–</button>
                      <span style={{ fontSize: 18, fontWeight: 700, minWidth: 28, textAlign: 'center' }}>{qty}</span>
                      <button
                        onClick={() => updateQty(section.id, 1)}
                        disabled={qty >= max}
                        style={{
                          width: 32, height: 32, borderRadius: 8, border: '1px solid var(--color-border)',
                          background: qty >= max ? '#f5f5f0' : '#fff', cursor: qty >= max ? 'not-allowed' : 'pointer',
                          fontSize: 18, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: qty >= max ? '#d1d5db' : '#1f1f1f', fontFamily: 'inherit',
                        }}
                      >+</button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div style={{ position: 'sticky', top: 100 }}>
          {totalTickets > 0 ? (
            <div className="card-white" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>
                  {totalTickets} ticket{totalTickets > 1 ? 's' : ''} selected
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {selectedTickets.map((ticket, i) => {
                  const key = ticket.sectionId + '_' + i
                  return (
                    <div key={key}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: i > 0 ? 6 : 0 }}>
                        <span style={{ fontSize: 14, fontWeight: 600 }}>
                          {ticket.sectionName} — {i === 0 ? 'For you' : `Guest ${i}`}
                        </span>
                        {ticket.price > 0 && (
                          <span style={{ fontSize: 13, color: '#726f63' }}>{formatPrice(ticket.price)}</span>
                        )}
                      </div>
                      {i > 0 && (
                        <input
                          type="text"
                          placeholder="Enter holder name"
                          value={holderNames[key] ?? ''}
                          onChange={(e) => setHolderNames((prev) => ({ ...prev, [key]: e.target.value }))}
                          style={{
                            width: '100%', padding: '8px 12px', borderRadius: 8,
                            border: '1px solid var(--color-border)', fontSize: 13,
                            boxSizing: 'border-box', fontFamily: 'inherit',
                          }}
                        />
                      )}
                    </div>
                  )
                })}
              </div>

              {totalPrice > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, marginTop: 12, borderTop: '1px solid var(--color-border)' }}>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>Total</span>
                  <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-accent)' }}>{formatPrice(totalPrice)}</span>
                </div>
              )}

              <button
                className="btn btn-primary"
                style={{ width: '100%', border: 'none', cursor: canProceed ? 'pointer' : 'not-allowed', marginTop: 16, opacity: canProceed ? 1 : 0.5 }}
                disabled={!canProceed}
                onClick={() =>
                  navigate('/customer/booking/checkout', {
                    state: {
                      zones: selectedTickets.map((t) => ({
                        sectionId: t.sectionId,
                        label: t.sectionName,
                      })),
                      eventId: event.id,
                    },
                  })
                }
              >
                Proceed to Checkout
              </button>
            </div>
          ) : (
            <div className="card-white" style={{ padding: 20, color: '#726f63', textAlign: 'center', fontSize: 14 }}>
              Select tickets above
            </div>
          )}
        </div>
      </div>
      </>
    </main>
  )
}