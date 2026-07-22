import { useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useEvents } from '../../events/hooks/useEvents'
import { useEvent } from '../../events/hooks/useEvent'
import { Badge } from '../../../shared/components/display/Badge/Badge'
import { Button } from '../../../shared/components/form/Button/Button'
import { Toggle } from '../../../shared/components/form/Toggle/Toggle'
import { HorizontalScroll } from '../../../shared/components/layout/HorizontalScroll/HorizontalScroll'
import { EventCard } from '../../../shared/components/ticket/EventCard/EventCard'
import { CATEGORIES } from '../../events/constants/categories'
import { formatDate, formatPrice, getArtVariant } from '../../events/utils/eventFormatters'
import type { EventFilters, TicketTier } from '../../events/types/event.types'

const STATUS_BADGE: Record<string, { label: string; variant: 'green' | 'yellow' | 'red' | 'soft' }> = {
  PUBLISHED: { label: 'Published', variant: 'green' },
  PENDING: { label: 'Pending', variant: 'yellow' },
  DRAFT: { label: 'Draft', variant: 'soft' },
  CANCELLED: { label: 'Cancelled', variant: 'red' },
  REJECTED: { label: 'Rejected', variant: 'red' },
}

const TAGS = ['live', 'festival', 'outdoor', 'indoor', 'family', 'night', 'concert']

export default function EventManagement() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<EventFilters>({})
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [tierToggles, setTierToggles] = useState<Record<string, boolean>>({})

  const { events, loading } = useEvents({ filters, page: 0, size: 20 })
  const { event: selectedEvent } = useEvent(selectedId)

  const selected = useMemo(() => {
    if (selectedEvent) return selectedEvent
    if (selectedId) return events.find((e) => e.id === selectedId) ?? null
    return events[0] ?? null
  }, [selectedEvent, selectedId, events])

  const handleSearch = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, title: value }))
  }, [])

  const handleCategoryChange = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, category: value }))
  }, [])

  const handleStatusChange = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, status: value }))
  }, [])

  const toggleTier = useCallback((tierId: string) => {
    setTierToggles((prev) => ({ ...prev, [tierId]: !prev[tierId] }))
  }, [])

  const totalTickets = selected && 'tiers' in selected
    ? selected.tiers.reduce((sum: number, t: TicketTier) => sum + t.total, 0)
    : 860
  const soldTickets = selected && 'tiers' in selected
    ? selected.tiers.reduce((sum: number, t: TicketTier) => sum + (t.total - t.available), 0)
    : 380
  const availableTickets = totalTickets - soldTickets

  return (
    <div className="wrap">

      {/* 1. Page title row */}
      <div className="page-title-row">
        <h1 className="section-title" style={{ margin: 0 }}>Event Management</h1>
        <Button variant="primary" onClick={() => navigate('/org/events/create')}>Create event</Button>
      </div>
      <p className="section-sub" style={{ marginBottom: 28 }}>Manage, edit, and organise your events</p>

      {/* 3. Filter bar */}
      <div className="filter-bar">
        <input
          className="form-input"
          type="search"
          placeholder="Search events…"
          value={filters.title ?? ''}
          onChange={(e) => handleSearch(e.target.value)}
        />
        <select
          className="form-select"
          value={filters.category ?? ''}
          onChange={(e) => handleCategoryChange(e.target.value)}
        >
          <option value="">All categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select
          className="form-select"
          value={filters.status ?? ''}
          onChange={(e) => handleStatusChange(e.target.value)}
        >
          <option value="">All status</option>
          <option value="PUBLISHED">Published</option>
          <option value="DRAFT">Draft</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* 4. Horizontal scroll event cards */}
      <section className="row-section" style={{ paddingTop: 0 }}>
        <HorizontalScroll>
          {events.map((event, i) => (
            <EventCard
              key={event.id}
              variant="scroll"
              title={event.title}
              meta={`${formatDate(event.startDate)} · ${event.venueName || 'TBD'}`}
              artVariant={getArtVariant(i)}
              cornerLabel={String(new Date(event.startDate).getDate())}
              onCtaClick={() => setSelectedId(event.id)}
            />
          ))}
        </HorizontalScroll>
      </section>

      {/* 5. Selected event detail card */}
      {selected && (
        <div className="card-white">
          <div className="detail-header">
            <div>
              <h2 className="detail-name">{selected.title}</h2>
              <Badge variant={STATUS_BADGE[selected.status]?.variant ?? 'soft'}>
                {STATUS_BADGE[selected.status]?.label ?? selected.status}
              </Badge>
            </div>
          </div>
          <div className="detail-grid">
            <div className="detail-field">
              <span className="detail-label">Date</span>
              <span className="detail-value">{formatDate(selected.startDate)}</span>
            </div>
            <div className="detail-field">
              <span className="detail-label">Time</span>
              <span className="detail-value">7:00 PM — 11:00 PM</span>
            </div>
            <div className="detail-field">
              <span className="detail-label">Venue</span>
              <span className="detail-value">{selected.venueName || 'TBD'}</span>
            </div>
            <div className="detail-field">
              <span className="detail-label">Category</span>
              <span className="detail-value">
                {selected.category && <Badge variant="yellow">{selected.category}</Badge>}
              </span>
            </div>
            <div className="detail-field">
              <span className="detail-label">Tags</span>
              <span className="detail-value tags-row">
                {TAGS.map((tag) => (
                  <span key={tag} className="badge-pill">{tag}</span>
                ))}
              </span>
            </div>
            <div className="detail-field detail-field-full">
              <span className="detail-label">Description</span>
              <span className="detail-value">
                {'description' in selected ? selected.description : 'Join us for an unforgettable evening under the stars featuring top Egyptian and international artists across three stages.'}
              </span>
            </div>
          </div>
          <div className="action-row">
            <Button variant="ghost" size="sm">Edit</Button>
            <Button variant="primary" size="sm">Unpublish</Button>
            <Button variant="danger" size="sm">Delete</Button>
          </div>
        </div>
      )}

      {/* 6. Categories & Tags card */}
      <div className="card-white">
        <h2 className="card-title" style={{ marginBottom: 16 }}>Categories &amp; Tags</h2>
        <div className="cat-section">
          <div className="cat-group">
            <span className="cat-group-label">Categories</span>
            <div className="cat-badges">
              {CATEGORIES.map((cat) => (
                <Badge key={cat} variant="ink" className="mono">{cat}</Badge>
              ))}
            </div>
          </div>
          <div className="cat-group">
            <span className="cat-group-label">Tags</span>
            <div className="tags-row">
              {TAGS.map((tag) => (
                <span key={tag} className="badge-pill">{tag}</span>
              ))}
            </div>
          </div>
        </div>
        <Button variant="ghost" size="sm" style={{ marginTop: 12 }}>Manage categories</Button>
      </div>

      {/* 7. Ticket Types table */}
      <div className="card-white">
        <div className="card-header-line">
          <h2 className="card-title">Ticket Types</h2>
          <Button variant="primary" size="sm">Add type</Button>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Price</th>
                <th>Available / Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {selected && 'tiers' in selected && selected.tiers.length > 0 ? (
                selected.tiers.map((tier: TicketTier) => (
                  <tr key={tier.id}>
                    <td><Badge variant="yellow" className="mono">{tier.name}</Badge></td>
                    <td style={{ fontWeight: 600 }}>{formatPrice(tier.price)}</td>
                    <td>{tier.available} / {tier.total}</td>
                    <td>
                      <Badge variant={tier.active ? 'green' : 'red'}>
                        {tier.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="action-cell">
                      <a href="#" className="action-link">Edit</a>
                      <Toggle
                        checked={tierToggles[tier.id] ?? tier.active}
                        onChange={() => toggleTier(tier.id)}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <>
                  <tr>
                    <td><Badge variant="yellow" className="mono">VIP</Badge></td>
                    <td style={{ fontWeight: 600 }}>EGP 1,500</td>
                    <td>50 / 100</td>
                    <td><Badge variant="green">Active</Badge></td>
                    <td className="action-cell">
                      <a href="#" className="action-link">Edit</a>
                      <Toggle checked={true} onChange={() => {}} />
                    </td>
                  </tr>
                  <tr>
                    <td><Badge variant="ink" className="mono">Regular</Badge></td>
                    <td style={{ fontWeight: 600 }}>EGP 450</td>
                    <td>200 / 500</td>
                    <td><Badge variant="green">Active</Badge></td>
                    <td className="action-cell">
                      <a href="#" className="action-link">Edit</a>
                      <Toggle checked={true} onChange={() => {}} />
                    </td>
                  </tr>
                  <tr>
                    <td><Badge variant="yellow" className="mono">Balcony</Badge></td>
                    <td style={{ fontWeight: 600 }}>EGP 800</td>
                    <td>30 / 60</td>
                    <td><Badge variant="green">Active</Badge></td>
                    <td className="action-cell">
                      <a href="#" className="action-link">Edit</a>
                      <Toggle checked={true} onChange={() => {}} />
                    </td>
                  </tr>
                  <tr>
                    <td><Badge variant="soft" className="mono">Student</Badge></td>
                    <td style={{ fontWeight: 600 }}>EGP 250</td>
                    <td>100 / 200</td>
                    <td><Badge variant="red">Inactive</Badge></td>
                    <td className="action-cell">
                      <a href="#" className="action-link">Edit</a>
                      <Toggle checked={false} onChange={() => {}} />
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 8. Inventory overview */}
      <div className="card-white">
        <h2 className="card-title" style={{ marginBottom: 16 }}>Inventory overview</h2>
        <div className="inventory-stats">
          <div className="stat-box">
            <span className="stat-num">{totalTickets}</span>
            <span className="stat-lbl mono">Total tickets</span>
          </div>
          <div className="stat-box">
            <span className="stat-num">{soldTickets}</span>
            <span className="stat-lbl mono">Sold</span>
          </div>
          <div className="stat-box">
            <span className="stat-num">{availableTickets}</span>
            <span className="stat-lbl mono">Available</span>
          </div>
        </div>
      </div>

      {/* 9. QR Code section */}
      <div className="card-white">
        <h2 className="card-title" style={{ marginBottom: 20 }}>QR Code &amp; Barcode</h2>
        <div className="qr-section">
          <div className="qr-sim"></div>
          <span className="qr-id mono">TICKET-2026-0719-0042</span>
          <Button variant="ghost" size="sm">Generate QR</Button>
        </div>
      </div>

      {/* 10. Validate Ticket section */}
      <div className="card-white">
        <h2 className="card-title" style={{ marginBottom: 16 }}>Validate Ticket</h2>
        <div className="search-bar" style={{ marginBottom: 16 }}>
          <input className="form-input" type="search" placeholder="Enter ticket ID or scan QR…" />
          <Button variant="primary">Validate</Button>
        </div>
        <div className="validation-result">
          <Badge variant="green" style={{ fontSize: 12, padding: '6px 14px' }}>VALID</Badge>
          <span className="mono" style={{ fontSize: 13, color: 'var(--text-secondary, #726f63)' }}>TICKET-2026-0719-0042</span>
        </div>
      </div>

    </div>
  )
}
