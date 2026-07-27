import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { useEvents } from '../../events/hooks/useEvents'
import { Badge } from '../../../shared/components/display/Badge/Badge'
import { Button } from '../../../shared/components/form/Button/Button'
import { formatDateTime } from '../../events/utils/eventFormatters'
import type { EventCardResponse, EventMode } from '../../events/types/event.types'
import '../../events/styles/events.css'

const STATUS_BADGE: Record<string, { label: string; variant: 'green' | 'yellow' | 'red' | 'soft' }> = {
  PUBLISHED: { label: 'Published', variant: 'green' },
  PENDING: { label: 'Pending', variant: 'yellow' },
  DRAFT: { label: 'Draft', variant: 'soft' },
  CANCELLED: { label: 'Cancelled', variant: 'red' },
  REJECTED: { label: 'Rejected', variant: 'red' },
}

const MODE_LABEL: Record<string, { label: string; variant: 'yellow' | 'ink' }> = {
  ZONE_BASED: { label: 'Zone Based', variant: 'yellow' },
  SEAT_BASED: { label: 'Seat Based', variant: 'ink' },
}

const TICKET_STATUS: Record<string, { label: string; variant: 'green' | 'yellow' | 'red' | 'soft' }> = {
  CONFIRMED: { label: 'Confirmed', variant: 'green' },
  PENDING: { label: 'Pending', variant: 'yellow' },
  CANCELLED: { label: 'Cancelled', variant: 'red' },
  USED: { label: 'Used', variant: 'ink' },
}

interface ReservedTicket {
  id: string
  holderName: string
  section: string
  seat?: string
  zone?: string
  price: number
  status: string
  reservedAt: string
}

const MOCK_TICKETS: Record<string, ReservedTicket[]> = {
  'evt-1': [
    { id: 't1', holderName: 'Ahmed Mohamed', section: 'VIP', zone: 'VIP', price: 1500, status: 'CONFIRMED', reservedAt: '2026-07-20T14:30:00' },
    { id: 't2', holderName: 'Sara Hassan', section: 'Standard A', zone: 'Standard A', price: 450, status: 'CONFIRMED', reservedAt: '2026-07-20T15:10:00' },
    { id: 't3', holderName: 'Omar Khaled', section: 'VIP', zone: 'VIP', price: 1500, status: 'PENDING', reservedAt: '2026-07-21T09:00:00' },
    { id: 't4', holderName: 'Laila Adel', section: 'Standard B', zone: 'Standard B', price: 350, status: 'CONFIRMED', reservedAt: '2026-07-21T11:20:00' },
    { id: 't5', holderName: 'Youssef Ali', section: 'General', zone: 'General', price: 200, status: 'USED', reservedAt: '2026-07-19T16:45:00' },
  ],
  'evt-2': [
    { id: 't6', holderName: 'Nadia Salem', section: 'Front Row', seat: 'A-12', price: 500, status: 'CONFIRMED', reservedAt: '2026-07-15T10:00:00' },
    { id: 't7', holderName: 'Karim Farouk', section: 'Front Row', seat: 'A-13', price: 500, status: 'CONFIRMED', reservedAt: '2026-07-15T10:05:00' },
    { id: 't8', holderName: 'Mona Rashed', section: 'Balcony', seat: 'B-07', price: 350, status: 'CANCELLED', reservedAt: '2026-07-16T14:00:00' },
  ],
  'evt-3': [
    { id: 't9', holderName: 'Hany Mostafa', section: 'General', seat: 'G-22', price: 250, status: 'CONFIRMED', reservedAt: '2026-07-10T08:30:00' },
    { id: 't10', holderName: 'Dina Naguib', section: 'VIP', seat: 'V-03', price: 600, status: 'PENDING', reservedAt: '2026-07-11T12:15:00' },
  ],
  'evt-5': [
    { id: 't11', holderName: 'Tamer Wagdy', section: 'Food Court A', zone: 'Food Court A', price: 120, status: 'CONFIRMED', reservedAt: '2026-08-01T09:00:00' },
  ],
  'evt-10': [
    { id: 't12', holderName: 'Fatma El-Sayed', section: 'VIP', zone: 'VIP', price: 800, status: 'CONFIRMED', reservedAt: '2026-07-25T13:00:00' },
    { id: 't13', holderName: 'Mahmoud Tarek', section: 'Standard', zone: 'Standard', price: 400, status: 'CONFIRMED', reservedAt: '2026-07-25T13:30:00' },
  ],
}

let nextId = 5

const INITIAL_SECTIONS = [
  { id: '1', name: 'VIP', variant: 'yellow' as const, price: 1500, capacity: 100, remaining: 50, reserved: 5 },
  { id: '2', name: 'Regular', variant: 'ink' as const, price: 450, capacity: 300, remaining: 200, reserved: 20 },
  { id: '3', name: 'Balcony', variant: 'yellow' as const, price: 800, capacity: 60, remaining: 30, reserved: 10 },
  { id: '4', name: 'Student', variant: 'soft' as const, price: 250, capacity: 200, remaining: 100, reserved: 0 },
]

type Section = typeof INITIAL_SECTIONS[number]

function EventRow({ event, isExpanded, onToggle }: {
  event: EventCardResponse
  isExpanded: boolean
  onToggle: () => void
}) {
  const mode: EventMode = event.mode || 'SEAT_BASED'
  const isZone = mode === 'ZONE_BASED'

  const [editing, setEditing] = useState(false)
  const [sections, setSections] = useState(INITIAL_SECTIONS)
  const [newRow, setNewRow] = useState<{ name: string; price: string; remaining: string; reserved: string } | null>(null)

  const [reserveModal, setReserveModal] = useState<{ sectionName: string } | null>(null)
  const [reserveVenue, setReserveVenue] = useState(false)
  const [ticketName, setTicketName] = useState('')
  const [toast, setToast] = useState(false)

  const [showTickets, setShowTickets] = useState(false)
  const [ticketList, setTicketList] = useState(MOCK_TICKETS[event.id] || [])

  const startEditing = () => setEditing(true)
  const saveEditing = () => setEditing(false)

  const updateField = (id: string, field: keyof Section, value: string) => {
    setSections((prev) =>
      prev.map((s) => s.id === id ? { ...s, [field]: field === 'name' ? value : Number(value) || 0 } : s)
    )
  }

  const addNewRow = () => setNewRow({ name: '', price: '', remaining: '', reserved: '' })
  const saveNewRow = () => {
    if (!newRow?.name.trim()) return
    const variants = ['yellow', 'ink', 'soft'] as const
    const capacity = Number(newRow.remaining) || 0
    setSections((prev) => [
      ...prev,
      { id: String(nextId++), name: newRow.name.trim(), variant: variants[prev.length % 3], price: Number(newRow.price) || 0, capacity, remaining: capacity, reserved: Number(newRow.reserved) || 0 },
    ])
    setNewRow(null)
  }
  const cancelNewRow = () => setNewRow(null)

  const handleReserve = () => {
    if (!ticketName.trim()) return
    setReserveModal(null)
    setReserveVenue(false)
    setTicketName('')
    setToast(true)
    setTimeout(() => setToast(false), 3000)
  }

  const cancelTicket = (id: string) => {
    setTicketList((prev) => prev.map((t) => t.id === id ? { ...t, status: 'CANCELLED' } : t))
  }

  return (
    <div className="event-row-wrap">
      <div className={`event-row ${isExpanded ? 'expanded' : ''}`}>
        <button className="event-row-chevron" onClick={onToggle}>
          {isExpanded ? 'v' : '>'}
        </button>
        <span className="event-row-name">{event.title}</span>
        <Badge variant={MODE_LABEL[mode]?.variant || 'soft'}>
          {MODE_LABEL[mode]?.label || mode}
        </Badge>
        <Badge variant={STATUS_BADGE[event.status]?.variant ?? 'soft'}>
          {STATUS_BADGE[event.status]?.label ?? event.status}
        </Badge>
      </div>

      {isExpanded && (
        <div className="event-row-card">
          <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            <span className="stat-chip" style={{ background: '#e8f5e9', color: '#2e7d32' }}>
              <span className="stat-chip-num">
                EGP {sections.reduce((sum, s) => sum + s.price * (s.capacity - s.remaining + s.reserved), 0).toLocaleString()}
              </span>
              Total Profit
            </span>
            <span className="stat-chip" style={{ background: '#fff3e0', color: '#e65100' }}>
              <span className="stat-chip-num">
                EGP {sections.reduce((sum, s) => sum + s.price * s.capacity, 0).toLocaleString()}
              </span>
              Max Profit
            </span>
            <span className="stat-chip">
              <span className="stat-chip-num">{sections.reduce((sum, s) => sum + (s.capacity - s.remaining + s.reserved), 0)}</span>
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
              <span className="detail-value">{event.endDate ? formatDateTime(event.endDate) : 'TBD'}</span>
            </div>
            <div className="detail-field">
              <span className="detail-label">Venue</span>
              <span className="detail-value">{event.venueName || 'TBD'}</span>
            </div>
            <div className="detail-field">
              <span className="detail-label">Category</span>
              <span className="detail-value">
                {event.category && <Badge variant="yellow">{event.category}</Badge>}
              </span>
            </div>
          </div>

          <div className="sections-table" style={{ marginTop: 20 }}>
            <h3 className="card-title" style={{ marginBottom: 12 }}>Sections</h3>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Capacity</th>
                    <th>Remaining</th>
                    {isZone && <th>Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {sections.map((s) => (
                    <tr key={s.id}>
                      <td><Badge variant={s.variant} className="mono">{s.name}</Badge></td>
                      <td>
                        {editing ? (
                          <input className="form-input price-input" type="number" value={s.price} onChange={(e) => updateField(s.id, 'price', e.target.value)} />
                        ) : (
                          <span style={{ fontWeight: 600 }}>EGP {s.price.toLocaleString()}</span>
                        )}
                      </td>
                      <td>{s.capacity}</td>
                      <td>{s.remaining}</td>
                      {isZone && (
                        <td>
                          <Button variant="ghost" size="sm" onClick={() => { setReserveModal({ sectionName: s.name }); setTicketName('') }}>
                            Reserve Ticket
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))}
                  {isZone && newRow && (
                    <tr className="new-section-row">
                      <td>
                        <input className="form-input price-input" type="text" placeholder="Section name" value={newRow.name} onChange={(e) => setNewRow((r) => r ? { ...r, name: e.target.value } : r)} />
                      </td>
                      <td>
                        <input className="form-input price-input" type="number" placeholder="0" value={newRow.price} onChange={(e) => setNewRow((r) => r ? { ...r, price: e.target.value } : r)} />
                      </td>
                      <td>-</td>
                      <td>
                        <input className="form-input price-input" type="number" placeholder="0" value={newRow.remaining} onChange={(e) => setNewRow((r) => r ? { ...r, remaining: e.target.value } : r)} />
                      </td>
                      <td></td>
                    </tr>
                  )}
                  {isZone && !newRow && (
                    <tr>
                      <td colSpan={5}>
                        <Button variant="ghost" size="sm" onClick={addNewRow}>+ Add New Section</Button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {isZone && newRow && (
              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <Button variant="primary" size="sm" onClick={saveNewRow}>Save Section</Button>
                <Button variant="ghost" size="sm" onClick={cancelNewRow}>Cancel</Button>
              </div>
            )}
          </div>

          {/* Reserved Tickets — collapsible */}
          <div style={{ marginTop: 20 }}>
            <button
              onClick={() => setShowTickets((v) => !v)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                display: 'flex', alignItems: 'center', gap: 8,
                fontFamily: "'Inter', sans-serif", fontSize: 18, fontWeight: 600, color: 'var(--ink)',
              }}
            >
              <span style={{ fontFamily: 'monospace', fontSize: 14 }}>{showTickets ? 'v' : '>'}</span>
              Reserved Tickets
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: 'var(--text-secondary)', fontWeight: 400 }}>
                ({ticketList.length})
              </span>
            </button>

            {showTickets && (
              <div style={{ marginTop: 12 }}>
                {ticketList.length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>No reserved tickets for this event.</p>
                ) : (
                  <div className="table-wrap">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Section</th>
                          {isZone ? <th>Zone</th> : <th>Seat</th>}
                          <th>Price</th>
                          <th>Status</th>
                          <th>Reserved</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {ticketList.map((t) => (
                          <tr key={t.id}>
                            <td style={{ fontWeight: 500 }}>{t.holderName}</td>
                            <td>{t.section}</td>
                            <td>{isZone ? t.zone : t.seat}</td>
                            <td style={{ fontWeight: 600 }}>EGP {t.price.toLocaleString()}</td>
                            <td>
                              <Badge variant={TICKET_STATUS[t.status]?.variant ?? 'soft'}>
                                {TICKET_STATUS[t.status]?.label ?? t.status}
                              </Badge>
                            </td>
                            <td style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: 'var(--text-secondary)' }}>
                              {formatDateTime(t.reservedAt)}
                            </td>
                            <td>
                              {t.status !== 'CANCELLED' && t.status !== 'USED' && (
                                <Button variant="danger" size="sm" onClick={() => cancelTicket(t.id)}>
                                  Cancel
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="action-row" style={{ marginTop: 16 }}>
            {isZone ? null : (
              <Button variant="primary" size="sm" onClick={() => { setReserveVenue(true); setTicketName('') }}>
                Reserve Ticket (Venue)
              </Button>
            )}
            {editing ? (
              <Button variant="primary" size="sm" onClick={saveEditing}>Save Event</Button>
            ) : (
              <Button variant="primary" size="sm" onClick={startEditing}>Update Event</Button>
            )}
            <Button variant="danger" size="sm">Cancel Event</Button>
          </div>
        </div>
      )}

      {/* Zone-based per-section reserve modal */}
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

      {/* Seat-based venue reserve modal */}
      {reserveVenue && createPortal(
        <div className="modal-overlay" onClick={() => setReserveVenue(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Reserve Ticket — {event.venueName || 'Venue'}</h2>
            <div className="modal-field">
              <label className="modal-label">Name on Ticket</label>
              <input className="form-input modal-input" type="text" value={ticketName} onChange={(e) => setTicketName(e.target.value)} placeholder="Enter attendee name" autoFocus />
            </div>
            <div className="modal-field">
              <label className="modal-label">Venue</label>
              <span className="modal-label" style={{ textTransform: 'none', letterSpacing: 'normal', fontSize: 15, fontWeight: 600 }}>{event.venueName || 'TBD'}</span>
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
        }}>Ticket reserved successfully</div>,
        document.body,
      )}
    </div>
  )
}

export default function EventManagement() {
  const navigate = useNavigate()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const { events, loading } = useEvents({ filters: {}, page: 0, size: 20 })

  const toggle = (id: string) => setExpandedId((prev) => (prev === id ? null : id))

  return (
    <div className="wrap">
      <div className="page-title-row">
        <h1 className="section-title" style={{ margin: 0 }}>Event Management</h1>
        <Button variant="primary" onClick={() => navigate('/org/events/create')}>Create event</Button>
      </div>
      <p className="section-sub" style={{ marginBottom: 28 }}>Manage, edit, and organise your events</p>

      {loading && <p style={{ color: 'var(--text-secondary)' }}>Loading events...</p>}

      {events.map((ev) => (
        <EventRow
          key={ev.id}
          event={ev}
          isExpanded={expandedId === ev.id}
          onToggle={() => toggle(ev.id)}
        />
      ))}
    </div>
  )
}
