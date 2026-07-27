import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useEvents } from '../../events/hooks/useEvents'
import { Badge } from '../../../shared/components/display/Badge/Badge'
import { Button } from '../../../shared/components/form/Button/Button'
import { formatDate } from '../../events/utils/eventFormatters'
import type { EventSummary } from '../../events/types/event.types'

const STATUS_BADGE: Record<string, { label: string; variant: 'green' | 'yellow' | 'red' | 'soft' }> = {
  PUBLISHED: { label: 'Published', variant: 'green' },
  PENDING: { label: 'Pending', variant: 'yellow' },
  DRAFT: { label: 'Draft', variant: 'soft' },
  CANCELLED: { label: 'Cancelled', variant: 'red' },
  REJECTED: { label: 'Rejected', variant: 'red' },
}

let nextId = 5

const INITIAL_SECTIONS = [
  { id: '1', name: 'VIP', variant: 'yellow' as const, price: 1500, remaining: 50, reserved: 5 },
  { id: '2', name: 'Regular', variant: 'ink' as const, price: 450, remaining: 200, reserved: 20 },
  { id: '3', name: 'Balcony', variant: 'yellow' as const, price: 800, remaining: 30, reserved: 10 },
  { id: '4', name: 'Student', variant: 'soft' as const, price: 250, remaining: 100, reserved: 0 },
]

type Section = typeof INITIAL_SECTIONS[number]

function EventRow({ event, isExpanded, onToggle }: {
  event: EventSummary
  isExpanded: boolean
  onToggle: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [sections, setSections] = useState(INITIAL_SECTIONS)
  const [newRow, setNewRow] = useState<{ name: string; price: string; remaining: string; reserved: string } | null>(null)

  const startEditing = () => setEditing(true)

  const saveEditing = () => {
    setEditing(false)
  }

  const updateField = (id: string, field: keyof Section, value: string) => {
    setSections((prev) =>
      prev.map((s) => s.id === id ? { ...s, [field]: field === 'name' ? value : Number(value) || 0 } : s)
    )
  }

  const addNewRow = () => {
    setNewRow({ name: '', price: '', remaining: '', reserved: '' })
  }

  const saveNewRow = () => {
    if (!newRow?.name.trim()) return
    const variants = ['yellow', 'ink', 'soft'] as const
    setSections((prev) => [
      ...prev,
      { id: String(nextId++), name: newRow.name.trim(), variant: variants[prev.length % 3], price: Number(newRow.price) || 0, remaining: Number(newRow.remaining) || 0, reserved: Number(newRow.reserved) || 0 },
    ])
    setNewRow(null)
  }

  const cancelNewRow = () => setNewRow(null)

  return (
    <div className="event-row-wrap">
      <div className={`event-row ${isExpanded ? 'expanded' : ''}`}>
        <button className="event-row-chevron" onClick={onToggle}>
          {isExpanded ? 'v' : '>'}
        </button>
        <span className="event-row-name">{event.title}</span>
        <Badge variant={STATUS_BADGE[event.status]?.variant ?? 'soft'}>
          {STATUS_BADGE[event.status]?.label ?? event.status}
        </Badge>
      </div>

      {isExpanded && (
        <div className="event-row-card">
          <div className="detail-grid">
            <div className="detail-field">
              <span className="detail-label">Date</span>
              <span className="detail-value">{formatDate(event.startDate)}</span>
            </div>
            <div className="detail-field">
              <span className="detail-label">Time</span>
              <span className="detail-value">7:00 PM — 11:00 PM</span>
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
                    <th>Remaining</th>
                    <th>Reserved</th>
                  </tr>
                </thead>
                <tbody>
                  {sections.map((s) => (
                    <tr key={s.id}>
                      <td><Badge variant={s.variant} className="mono">{s.name}</Badge></td>
                      <td>
                        {editing ? (
                          <input
                            className="form-input price-input"
                            type="number"
                            value={s.price}
                            onChange={(e) => updateField(s.id, 'price', e.target.value)}
                          />
                        ) : (
                          <span style={{ fontWeight: 600 }}>EGP {s.price.toLocaleString()}</span>
                        )}
                      </td>
                      <td>{s.remaining}</td>
                      <td>
                        {editing ? (
                          <input
                            className="form-input price-input"
                            type="number"
                            value={s.reserved}
                            onChange={(e) => updateField(s.id, 'reserved', e.target.value)}
                          />
                        ) : (
                          s.reserved
                        )}
                      </td>
                    </tr>
                  ))}
                  {newRow && (
                    <tr className="new-section-row">
                      <td>
                        <input
                          className="form-input price-input"
                          type="text"
                          placeholder="Section name"
                          value={newRow.name}
                          onChange={(e) => setNewRow((r) => r ? { ...r, name: e.target.value } : r)}
                        />
                      </td>
                      <td>
                        <input
                          className="form-input price-input"
                          type="number"
                          placeholder="0"
                          value={newRow.price}
                          onChange={(e) => setNewRow((r) => r ? { ...r, price: e.target.value } : r)}
                        />
                      </td>
                      <td>
                        <input
                          className="form-input price-input"
                          type="number"
                          placeholder="0"
                          value={newRow.remaining}
                          onChange={(e) => setNewRow((r) => r ? { ...r, remaining: e.target.value } : r)}
                        />
                      </td>
                      <td>
                        <input
                          className="form-input price-input"
                          type="number"
                          placeholder="0"
                          value={newRow.reserved}
                          onChange={(e) => setNewRow((r) => r ? { ...r, reserved: e.target.value } : r)}
                        />
                      </td>
                    </tr>
                  )}
                  {!newRow && (
                    <tr>
                      <td colSpan={4}>
                        <Button variant="ghost" size="sm" onClick={addNewRow}>+ Add New Section</Button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {newRow && (
              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <Button variant="primary" size="sm" onClick={saveNewRow}>Save Section</Button>
                <Button variant="ghost" size="sm" onClick={cancelNewRow}>Cancel</Button>
              </div>
            )}
          </div>

          <div className="action-row" style={{ marginTop: 16 }}>
            {editing ? (
              <Button variant="primary" size="sm" onClick={saveEditing}>Save Event</Button>
            ) : (
              <Button variant="primary" size="sm" onClick={startEditing}>Update Event</Button>
            )}
            <Button variant="danger" size="sm">Cancel Event</Button>
          </div>
        </div>
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
