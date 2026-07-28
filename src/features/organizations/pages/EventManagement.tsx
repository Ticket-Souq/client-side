import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { EventApi } from '../../events/services/eventApi'
import { Badge } from '../../../shared/components/display/Badge/Badge'
import { Button } from '../../../shared/components/form/Button/Button'
import { formatDateTime } from '../../events/utils/eventFormatters'
import { API } from '../../../shared/api'
import type { EventFullResponse } from '../../events/types/event.types'
import '../../events/styles/events.css'

const STATUS_BADGE: Record<string, { label: string; variant: 'green' | 'yellow' | 'red' | 'soft' }> = {
  PUBLISHED: { label: 'Published', variant: 'green' },
  ACTIVE: { label: 'Active', variant: 'green' },
  COMPLETED: { label: 'Completed', variant: 'soft' },
  CANCELLED: { label: 'Cancelled', variant: 'red' },
}

const MODE_LABEL: Record<string, { label: string; variant: 'yellow' | 'ink' | 'soft' }> = {
  ZONE: { label: 'Zone Based', variant: 'yellow' },
  SEAT: { label: 'Seat Based', variant: 'ink' },
  MIXED: { label: 'Mixed', variant: 'soft' },
}

const SECTION_VARIANTS = ['yellow', 'ink', 'soft'] as const

type ViewMode = 'list' | 'card'

interface ReservedTicket {
  id: string
  code: string
  seat: string
  section: string
  customer: string
  purchaseDate: string
  status: 'reserved' | 'confirmed' | 'cancelled'
}

const TICKET_STATUS: Record<string, { label: string; variant: 'green' | 'yellow' | 'red' | 'soft' }> = {
  reserved: { label: 'Reserved', variant: 'yellow' },
  confirmed: { label: 'Confirmed', variant: 'green' },
  cancelled: { label: 'Cancelled', variant: 'red' },
}

const MOCK_TICKETS: ReservedTicket[] = [
  { id: '1', code: 'TKT-001', seat: 'A1', section: 'VIP', customer: 'Ahmed Ali', purchaseDate: '2026-07-10', status: 'confirmed' },
  { id: '2', code: 'TKT-002', seat: 'A2', section: 'VIP', customer: 'Sara Mohamed', purchaseDate: '2026-07-11', status: 'reserved' },
  { id: '3', code: 'TKT-003', seat: 'B1', section: 'Standard', customer: 'Omar Hassan', purchaseDate: '2026-07-12', status: 'confirmed' },
  { id: '4', code: 'TKT-004', seat: 'B2', section: 'Standard', customer: 'Layla Khaled', purchaseDate: '2026-07-13', status: 'cancelled' },
]

function EventExpandedDetails({ event }: { event: EventFullResponse }) {
  const bookingModel = event.bookingModel || 'SEAT'
  const isZone = bookingModel === 'ZONE'

  const [reserveModal, setReserveModal] = useState<{ sectionName: string } | null>(null)
  const [reserveVenue, setReserveVenue] = useState(false)
  const [ticketName, setTicketName] = useState('')
  const [toast, setToast] = useState<string | null>(null)
  const [showTickets, setShowTickets] = useState(false)
  const [tickets, setTickets] = useState<ReservedTicket[]>(MOCK_TICKETS)

  const [editingIdx, setEditingIdx] = useState<number | null>(null)
  const [editFields, setEditFields] = useState<{ name: string; price: string }>({ name: '', price: '' })
  const [addingSection, setAddingSection] = useState(false)
  const [newSection, setNewSection] = useState({ name: '', price: '', capacity: '' })

  const totalCapacity = event.sections.reduce((sum, s) => sum + (s.capacity || 0), 0)
  const totalRemaining = event.sections.reduce((sum, s) => sum + (s.remainingCapacity || 0), 0)
  const totalSold = totalCapacity - totalRemaining
  const totalRevenue = event.sections.reduce((sum, s) => sum + ((s.capacity || 0) - (s.remainingCapacity || 0)) * (s.price || 0), 0)

  const handleReserve = () => {
    if (!ticketName.trim()) return
    setReserveModal(null)
    setReserveVenue(false)
    setTicketName('')
    showToast('Ticket reserved successfully')
  }

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const startEditing = (idx: number) => {
    const s = event.sections[idx]
    setEditingIdx(idx)
    setEditFields({ name: s.name, price: String(s.price || 0) })
  }

  const saveEditing = () => {
    setEditingIdx(null)
    showToast('Section updated')
  }

  const addNewRow = () => {
    if (!newSection.name.trim() || !newSection.price || !newSection.capacity) return
    setAddingSection(false)
    setNewSection({ name: '', price: '', capacity: '' })
    showToast('Section added')
  }

  const cancelTicket = (id: string) => {
    setTickets((prev) => prev.map((t) => t.id === id ? { ...t, status: 'cancelled' as const } : t))
    showToast('Ticket cancelled')
  }

  return (
    <>
      <div className="event-row-card">
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <span className="stat-chip" style={{ background: '#e8f5e9', color: '#2e7d32' }}>
            <span className="stat-chip-num">EGP {totalRevenue.toLocaleString()}</span>
            Total Revenue
          </span>
          <span className="stat-chip" style={{ background: '#fff3e0', color: '#e65100' }}>
            <span className="stat-chip-num">EGP {event.sections.reduce((sum, s) => sum + (s.capacity || 0) * (s.price || 0), 0).toLocaleString()}</span>
            Max Revenue
          </span>
          <span className="stat-chip">
            <span className="stat-chip-num">{totalSold}</span>
            Tickets Sold
          </span>
        </div>

        <div className="detail-grid">
          <div className="detail-field">
            <span className="detail-label">Start Date &amp; Time</span>
            <span className="detail-value">{formatDateTime(event.startDate)}</span>
          </div>
          <div className="detail-field">
            <span className="detail-label">End Date &amp; Time</span>
            <span className="detail-value">{event.finishDate ? formatDateTime(event.finishDate) : 'TBD'}</span>
          </div>
          <div className="detail-field">
            <span className="detail-label">Location</span>
            <span className="detail-value">{event.location || 'TBD'}</span>
          </div>
          <div className="detail-field">
            <span className="detail-label">Category</span>
            <span className="detail-value">
              {event.eventCategoryName && <Badge variant="yellow">{event.eventCategoryName}</Badge>}
            </span>
          </div>
        </div>

        <div className="sections-table" style={{ marginTop: 20 }}>
          <div className="card-header-line">
            <h3 className="card-title">Sections</h3>
            {isZone && !addingSection && (
              <Button variant="ghost" size="sm" onClick={() => setAddingSection(true)}>+ Add Section</Button>
            )}
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Capacity</th>
                  <th>Remaining</th>
                  <th>Sold</th>
                  {isZone && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {event.sections.map((s, idx) => {
                  const sold = (s.capacity || 0) - (s.remainingCapacity || 0)
                  const isEditing = editingIdx === idx
                  return (
                    <tr key={s.id}>
                      <td>
                        {isEditing ? (
                          <input className="form-input" style={{ height: 28, width: 140, padding: '0 10px', fontSize: 13 }} value={editFields.name} onChange={(e) => setEditFields((f) => ({ ...f, name: e.target.value }))} />
                        ) : (
                          <Badge variant={SECTION_VARIANTS[idx % 3]} className="mono">{s.name}</Badge>
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <input className="price-input" type="number" value={editFields.price} onChange={(e) => setEditFields((f) => ({ ...f, price: e.target.value }))} />
                        ) : (
                          <span style={{ fontWeight: 600 }}>EGP {(s.price || 0).toLocaleString()}</span>
                        )}
                      </td>
                      <td>{s.capacity}</td>
                      <td>{s.remainingCapacity}</td>
                      <td>{sold}</td>
                      {isZone && (
                        <td className="table-actions">
                          {isEditing ? (
                            <button className="action-link" onClick={saveEditing}>Save</button>
                          ) : (
                            <button className="action-link" onClick={() => startEditing(idx)}>Edit</button>
                          )}
                          <Button variant="ghost" size="sm" style={{ height: 28, padding: '0 12px', fontSize: 13 }} onClick={() => { setReserveModal({ sectionName: s.name }); setTicketName('') }}>
                            Reserve
                          </Button>
                        </td>
                      )}
                    </tr>
                  )
                })}
                {addingSection && (
                  <tr className="new-section-row">
                    <td><input className="form-input" style={{ height: 28, width: 140, padding: '0 10px', fontSize: 13 }} placeholder="Section name" value={newSection.name} onChange={(e) => setNewSection((s) => ({ ...s, name: e.target.value }))} autoFocus /></td>
                    <td><input className="price-input" type="number" placeholder="0" value={newSection.price} onChange={(e) => setNewSection((s) => ({ ...s, price: e.target.value }))} /></td>
                    <td><input className="form-input" style={{ height: 28, width: 80, padding: '0 10px', fontSize: 13 }} type="number" placeholder="0" value={newSection.capacity} onChange={(e) => setNewSection((s) => ({ ...s, capacity: e.target.value }))} /></td>
                    <td>-</td>
                    <td>-</td>
                    {isZone && (
                      <td className="table-actions">
                        <button className="action-link" onClick={addNewRow}>Save</button>
                        <button className="action-link" onClick={() => { setAddingSection(false); setNewSection({ name: '', price: '', capacity: '' }) }}>Cancel</button>
                      </td>
                    )}
                  </tr>
                )}
                {event.sections.length === 0 && !addingSection && (
                  <tr>
                    <td colSpan={isZone ? 6 : 5} style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: 20 }}>
                      No sections configured
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          <button
            className="action-link"
            style={{ fontSize: 14, fontWeight: 600, marginBottom: showTickets ? 12 : 0 }}
            onClick={() => setShowTickets((v) => !v)}
          >
            {showTickets ? 'Hide Reserved Tickets' : 'Show Reserved Tickets'} ({tickets.length})
          </button>
          {showTickets && (
            <div className="table-wrap">
              <table className="table" style={{ marginTop: 8 }}>
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Seat</th>
                    <th>Section</th>
                    <th>Customer</th>
                    <th>Purchase Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((t) => (
                    <tr key={t.id}>
                      <td><span className="mono" style={{ fontSize: 13 }}>{t.code}</span></td>
                      <td>{t.seat}</td>
                      <td>{t.section}</td>
                      <td>{t.customer}</td>
                      <td>{t.purchaseDate}</td>
                      <td>
                        <Badge variant={TICKET_STATUS[t.status]?.variant ?? 'soft'}>
                          {TICKET_STATUS[t.status]?.label ?? t.status}
                        </Badge>
                      </td>
                      <td className="table-actions">
                        {t.status !== 'cancelled' && (
                          <button className="action-link ban" onClick={() => cancelTicket(t.id)}>Cancel</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="action-row">
          {!isZone && (
            <Button variant="primary" size="sm" onClick={() => { setReserveVenue(true); setTicketName('') }}>
              Reserve Ticket (Venue)
            </Button>
          )}
          <Button variant="primary" size="sm">Update Event</Button>
          <Button variant="danger" size="sm">Cancel Event</Button>
        </div>
      </div>

      {reserveModal && createPortal(
        <div className="modal-overlay" onClick={() => setReserveModal(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Reserve Ticket</h2>
            <div className="modal-field">
              <label className="modal-label">Section</label>
              <span className="modal-label" style={{ textTransform: 'none', letterSpacing: 'normal', fontSize: 15, fontWeight: 600 }}>{reserveModal.sectionName}</span>
            </div>
            <div className="modal-field">
              <label className="modal-label">Name on Ticket</label>
              <input className="form-input modal-input" type="text" value={ticketName} onChange={(e) => setTicketName(e.target.value)} placeholder="Enter attendee name" autoFocus />
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost btn-sm" onClick={() => setReserveModal(null)}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={handleReserve}>Confirm</button>
            </div>
          </div>
        </div>,
        document.body,
      )}

      {reserveVenue && createPortal(
        <div className="modal-overlay" onClick={() => setReserveVenue(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Reserve Ticket — {event.location || 'Venue'}</h2>
            <div className="modal-field">
              <label className="modal-label">Name on Ticket</label>
              <input className="form-input modal-input" type="text" value={ticketName} onChange={(e) => setTicketName(e.target.value)} placeholder="Enter attendee name" autoFocus />
            </div>
            <div className="modal-field">
              <label className="modal-label">Location</label>
              <span className="modal-label" style={{ textTransform: 'none', letterSpacing: 'normal', fontSize: 15, fontWeight: 600 }}>{event.location || 'TBD'}</span>
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost btn-sm" onClick={() => setReserveVenue(false)}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={handleReserve}>Confirm</button>
            </div>
          </div>
        </div>,
        document.body,
      )}

      {toast && createPortal(
        <div style={{
          position: 'fixed',
          bottom: 32,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--ink)',
          color: 'var(--white)',
          padding: '14px 28px',
          borderRadius: 999,
          fontSize: 14,
          fontWeight: 600,
          fontFamily: "'Inter', sans-serif",
          zIndex: 9999,
          boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
        }}>{toast}</div>,
        document.body,
      )}
    </>
  )
}

function EventRow({ event, isExpanded, onToggle }: {
  event: EventFullResponse
  isExpanded: boolean
  onToggle: () => void
}) {
  const bookingModel = event.bookingModel || 'SEAT'

  return (
    <div className="event-row-wrap">
      <div className={`event-row ${isExpanded ? 'expanded' : ''}`}>
        <button className="event-row-chevron" onClick={onToggle}>
          {isExpanded ? 'v' : '>'}
        </button>
        {event.PosterUrl && (
          <img
            src={API.base + event.PosterUrl}
            alt={event.title}
            style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }}
          />
        )}
        <span className="event-row-name">{event.title}</span>
        <Badge variant={MODE_LABEL[bookingModel]?.variant || 'soft'}>
          {MODE_LABEL[bookingModel]?.label || bookingModel}
        </Badge>
        <Badge variant={STATUS_BADGE[event.status]?.variant ?? 'soft'}>
          {STATUS_BADGE[event.status]?.label ?? event.status}
        </Badge>
      </div>
      {isExpanded && <EventExpandedDetails event={event} />}
    </div>
  )
}

function EventCard({ event, isExpanded, onToggle }: {
  event: EventFullResponse
  isExpanded: boolean
  onToggle: () => void
}) {
  const bookingModel = event.bookingModel || 'SEAT'

  return (
    <div className="mgmt-card-wrap">
      <div
        className={`mgmt-card ${isExpanded ? 'expanded' : ''}`}
        onClick={onToggle}
        style={{ cursor: 'pointer' }}
      >
        {event.PosterUrl ? (
          <img
            src={API.base + event.PosterUrl}
            alt={event.title}
            style={{ width: '100%', height: 180, objectFit: 'cover' }}
          />
        ) : (
          <div style={{ width: '100%', height: 180, background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: 14 }}>
            No poster
          </div>
        )}
        <div style={{ padding: '14px 16px' }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink)', marginBottom: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {event.title}
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <Badge variant={MODE_LABEL[bookingModel]?.variant || 'soft'}>
              {MODE_LABEL[bookingModel]?.label || bookingModel}
            </Badge>
            <Badge variant={STATUS_BADGE[event.status]?.variant ?? 'soft'}>
              {STATUS_BADGE[event.status]?.label ?? event.status}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function EventManagement() {
  const navigate = useNavigate()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [events, setEvents] = useState<EventFullResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    try {
      const res = await EventApi.getManagement(page, 20)
      setEvents(res.content)
      setTotalPages(res.totalPages)
    } catch (err) {
      console.error('Failed to load events:', err)
      setEvents([])
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  const toggle = (id: string) => setExpandedId((prev) => (prev === id ? null : id))

  const expandedIdx = expandedId ? events.findIndex((ev) => ev.id === expandedId) : -1
  const beforeEvents = expandedIdx >= 0 ? events.slice(0, expandedIdx) : []
  const afterEvents = expandedIdx >= 0 ? events.slice(expandedIdx + 1) : []
  const expandedEvent = expandedIdx >= 0 ? events[expandedIdx] : null

  const renderCardGrid = (items: EventFullResponse[]) => (
    <div className="mgmt-card-grid">
      {items.map((ev) => (
        <EventCard key={ev.id} event={ev} isExpanded={false} onToggle={() => toggle(ev.id)} />
      ))}
    </div>
  )

  return (
    <div className="wrap">
      <div className="page-title-row">
        <h1 className="section-title" style={{ margin: 0 }}>Event Management</h1>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div className="mgmt-view-toggle">
            <button
              className={`mgmt-view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List view"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </button>
            <button
              className={`mgmt-view-btn ${viewMode === 'card' ? 'active' : ''}`}
              onClick={() => setViewMode('card')}
              title="Card view"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5"/></svg>
            </button>
          </div>
          <Button variant="primary" onClick={() => navigate('/org/events/create')}>Create event</Button>
        </div>
      </div>
      <p className="section-sub" style={{ marginBottom: 28 }}>Manage, edit, and organise your events</p>

      {loading && <p style={{ color: 'var(--text-secondary)' }}>Loading events...</p>}

      {!loading && events.length === 0 && (
        <p style={{ color: 'var(--text-secondary)' }}>No events found. Create your first event to get started.</p>
      )}

      {viewMode === 'list' && events.map((ev) => (
        <EventRow
          key={ev.id}
          event={ev}
          isExpanded={expandedId === ev.id}
          onToggle={() => toggle(ev.id)}
        />
      ))}

      {viewMode === 'card' && (
        <>
          {beforeEvents.length > 0 && renderCardGrid(beforeEvents)}
          {expandedEvent && (
            <div style={{ marginTop: beforeEvents.length > 0 ? 20 : 0, marginBottom: afterEvents.length > 0 ? 20 : 0 }}>
              <EventExpandedDetails event={expandedEvent} />
            </div>
          )}
          {afterEvents.length > 0 && renderCardGrid(afterEvents)}
          {!expandedEvent && renderCardGrid(events)}
        </>
      )}

      {totalPages > 1 && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 24 }}>
          <Button variant="ghost" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Previous</Button>
          <span style={{ alignSelf: 'center', fontSize: 14, color: 'var(--text-secondary)' }}>
            Page {page + 1} of {totalPages}
          </span>
          <Button variant="ghost" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  )
}
