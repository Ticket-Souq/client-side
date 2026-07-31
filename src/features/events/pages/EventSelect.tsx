import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useEvent } from "../hooks/useEvent";
import { LoadingSkeleton } from "../components/LoadingSkeleton";
import { SeatMapPreview } from "../../../shared/components/seatmap/SeatMapPreview";
import type { SeatReservation } from "../../../shared/components/seatmap/SeatMapPreview";
import type { SeatMap } from "../../venues/components/types";
import { getTemplateById } from "../../venues/api/venueApi";
import { formatEventDate } from "../utils/eventFormatters";

interface SelectedSeat {
  cellId: string
  label: string
  sectionName: string
  price: number
}

export default function EventSelect() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { event, loading, error } = useEvent(eventId ?? null);
  const [templateMap, setTemplateMap] = useState<SeatMap | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([]);
  const [holderNames, setHolderNames] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(600)
  const [timedOut, setTimedOut] = useState(false)

  useEffect(() => {
    if (timedOut) return
    if (timeLeft <= 0) {
      setTimedOut(true)
      setSelectedSeats([])
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

  useEffect(() => {
    if (!event?.venueTemplateId) return;
    (async () => {
      try {
        const tpl = await getTemplateById(event.venueTemplateId!);
        setTemplateMap(JSON.parse(tpl.layout) as SeatMap);
      } catch { /* ignore */ }
    })();
  }, [event?.venueTemplateId]);

  const reservations: SeatReservation[] = useMemo(() => {
    if (!event?.sections) return [];
    const result: SeatReservation[] = [];
    for (const sec of event.sections) {
      for (const seat of sec.seats) {
        if (seat.status !== 'AVAILABLE' && seat.id) {
          result.push({ cellId: seat.templateSeatId ?? seat.id, rowLabel: '', seatNumber: '', holderName: '' });
        }
      }
    }
    return result;
  }, [event?.sections]);

  // Map template cell categoryId → section price info
  const sectionPriceMap = useMemo(() => {
    if (!templateMap || !event?.sections) return new Map<string, { sectionName: string; price: number; color: string }>()
    const map = new Map<string, { sectionName: string; price: number; color: string }>()
    for (const category of templateMap.categories) {
      const section = event.sections.find((s) => s.templateSectionId === category.id || s.color === category.color)
      if (section) {
        map.set(category.id, { sectionName: section.name, price: Number(section.price ?? 0), color: category.color })
      }
    }
    // Also map by cellId for direct lookup
    for (const row of templateMap.rows) {
      for (const cell of row.cells) {
        if (cell.categoryId && map.has(cell.categoryId)) {
          map.set(cell.id, map.get(cell.categoryId)!)
        }
      }
    }
    return map
  }, [templateMap, event?.sections])

  const selectedCellIds = useMemo(() => new Set(selectedSeats.map((s) => s.cellId)), [selectedSeats]);

  const handleSeatSelect = useCallback((cellId: string, rowLabel: string, seatNumber: string) => {
    setSelectedSeats((prev) => {
      const idx = prev.findIndex((s) => s.cellId === cellId);
      if (idx !== -1) {
        const updated = prev.slice(0, idx)
        setHolderNames((names) => {
          const next = { ...names }
          delete next[cellId]
          return next
        })
        return updated
      }
      const info = sectionPriceMap.get(cellId)
      return [...prev, { cellId, label: `${rowLabel}${seatNumber}`, sectionName: info?.sectionName ?? '', price: info?.price ?? 0 }]
    });
  }, [sectionPriceMap]);

  const updateHolderName = (cellId: string, name: string) => {
    setHolderNames((prev) => ({ ...prev, [cellId]: name }))
  }

  const totalPrice = useMemo(() => selectedSeats.reduce((sum, s) => sum + s.price, 0), [selectedSeats])

  const formatPrice = (price: number) => `EGP ${price.toLocaleString()}`

  const canProceed = selectedSeats.length === 0 ||
    selectedSeats.every((s, i) => i === 0 || (holderNames[s.cellId]?.trim() ?? '') !== '')

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
        <div className="container py-5 text-center">
          <h2>Event not found</h2>
          <button className="btn btn-accent mt-3" onClick={() => navigate("/")}>
            &larr; Back to events
          </button>
        </div>
      </div>
    );
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
    );
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
        <h1 className="page-title display">Select Your Seat</h1>
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

      {templateMap ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 32, alignItems: 'start' }}>
          <div>
            <SeatMapPreview map={templateMap} reservations={reservations} onSeatSelect={handleSeatSelect} selectedCellIds={selectedCellIds} cellSize={28} cellGap={4} />
          </div>

          <div style={{ position: 'sticky', top: 100 }}>
            {selectedSeats.length > 0 ? (
              <div className="card-white" style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>
                    {selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''} selected
                  </h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {selectedSeats.map((seat, i) => (
                    <div key={seat.cellId}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: i > 0 ? 6 : 0 }}>
                        <span style={{ fontSize: 14, fontWeight: 600 }}>
                          {seat.label} — {i === 0 ? 'For you' : `Guest ${i}`}
                        </span>
                        {seat.price > 0 && (
                          <span style={{ fontSize: 13, color: '#726f63' }}>{formatPrice(seat.price)}</span>
                        )}
                      </div>
                      {seat.sectionName && (
                        <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 2 }}>{seat.sectionName}</div>
                      )}
                      {i > 0 && (
                        <input
                          type="text"
                          placeholder="Enter holder name"
                          value={holderNames[seat.cellId] ?? ''}
                          onChange={(e) => updateHolderName(seat.cellId, e.target.value)}
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
                  style={{ width: '100%', border: 'none', cursor: canProceed ? 'pointer' : 'not-allowed', marginTop: 16, opacity: canProceed ? 1 : 0.5 }}
                  disabled={!canProceed}
                  onClick={() =>
                    navigate('/customer/booking/checkout', {
                      state: {
                        seats: selectedSeats.map((s) => ({
                          cellId: s.cellId,
                          label: s.label,
                          holderName: holderNames[s.cellId] ?? '',
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
                Click on a seat to select it
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={{ padding: 40, textAlign: 'center', color: '#726f63', fontSize: 14 }}>
          Loading seat map...
        </div>
      )}
      </>
    </main>
  );
}