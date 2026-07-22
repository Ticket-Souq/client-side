import { useState } from 'react'
import { formatPrice } from '../utils/eventFormatters'
import type { Zone, TicketTier } from '../types/event.types'

interface Props {
  zones: Zone[]
  tiers: TicketTier[]
  eventTitle: string
  onSelectZone?: (zoneId: string) => void
  onContinue?: (selected: { zoneId: string; tierId: string; quantity: number }) => void
}

export function ZonePurchaseGrid({ zones, tiers, eventTitle, onContinue }: Props) {
  const [selectedZone, setSelectedZone] = useState<string | null>(null)
  const [selectedTier, setSelectedTier] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)

  const zone = zones.find((z) => z.id === selectedZone)

  const handleContinue = () => {
    if (selectedZone && selectedTier) {
      onContinue?.({ zoneId: selectedZone, tierId: selectedTier, quantity })
    }
  }

  const zoneClassName = (z: Zone) => {
    const base = `zone ${z.id === 'vip' ? 'zone-vip' : ''}`
    if (selectedZone === z.id) return `${base} zone-selected`
    if (z.status === 'soldout') return `${base} zone-soldout`
    if (z.status === 'limited') return `${base} zone-limited`
    return base
  }

  const zoneColor = (z: Zone) => {
    if (z.status === 'available' || z.status === undefined) return z.color || '#4caf50'
    if (z.status === 'soldout') return '#bdbdbd'
    if (z.status === 'limited') return '#ff9800'
    return z.color || '#4caf50'
  }

  return (
    <div className="zone-grid">
      <div className="zone-map-wrap">
        <div className="card-white">
          <h3 className="section-title">Venue map</h3>
          <div className="stage-area"><span>STAGE</span></div>
          <div className="zone-map">
            {zones.map((z) => (
              <div
                key={z.id}
                className={zoneClassName(z)}
                data-zone={z.id}
                onClick={() => { if (z.status !== 'soldout') { setSelectedZone(z.id); setSelectedTier(null) } }}
              >
                <span className="zone-label">{z.name}</span>
                <span className="zone-seats mono">{z.spotsAvailable ?? z.spotsTotal ?? '—'} spots</span>
              </div>
            ))}
          </div>
          <div className="legend">
            <span className="legend-item"><span className="legend-dot legend-available" /> Available</span>
            <span className="legend-item"><span className="legend-dot legend-selected" /> Selected</span>
            <span className="legend-item"><span className="legend-dot legend-limited" /> Limited</span>
            <span className="legend-item"><span className="legend-dot legend-soldout" /> Sold out</span>
          </div>
        </div>
      </div>

      <div className="side-stack">
        <div className="card-white">
          <h3 className="section-title">Your selection</h3>
          {zone ? (
            <>
              <div className="sel-zone">
                <span className="sel-zone-name">{zone.name}</span>
                <span className={`badge ${zone.status === 'limited' ? 'badge-orange' : zone.status === 'available' ? 'badge-green' : 'badge-ink'} mono`}>
                  {zone.status === 'available' ? 'Available' : zone.status === 'limited' ? 'Limited' : 'Sold out'}
                </span>
              </div>
              <div className="sel-details">
                <div className="sel-row">
                  <span className="sel-label mono">Zone</span>
                  <span className="sel-value">{zone.name} — {zone.section || 'Center'}</span>
                </div>
                <div className="sel-row">
                  <span className="sel-label mono">Price per ticket</span>
                  <span className="sel-value">{formatPrice(zone.price)}</span>
                </div>
              </div>

              <div className="qty-row">
                <span className="sel-label mono">Quantity</span>
                <div className="qty-controls">
                  <button className="qty-btn" onClick={() => setQuantity(Math.max(1, quantity - 1))}>&minus;</button>
                  <span className="qty-value">{quantity}</span>
                  <button className="qty-btn" onClick={() => setQuantity(Math.min(10, quantity + 1))}>+</button>
                </div>
              </div>

              <div className="ss-price">{formatPrice(zone.price * quantity)}</div>
              <div className="ss-actions">
                <button className="btn btn-ghost btn-sm" style={{ border: 'none', cursor: 'pointer' }} onClick={() => { setSelectedZone(null); setSelectedTier(null); setQuantity(1) }}>Clear selection</button>
                <button className="btn btn-primary" style={{ border: 'none', cursor: 'pointer' }} onClick={handleContinue} disabled={!selectedTier}>Continue to checkout</button>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)', fontSize: 14 }}>
              Click a zone to see details
            </div>
          )}
        </div>

        <div className="card-white">
          <h3 className="section-title">Zone info</h3>
          <div className="zone-info-list">
            {zones.map((z) => (
              <div key={z.id} className="zone-info-item">
                <span className="zone-info-dot" style={{ background: zoneColor(z) }} />
                <span className="zone-info-name">{z.name}</span>
                <span className="zone-info-price mono">{formatPrice(z.price)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
