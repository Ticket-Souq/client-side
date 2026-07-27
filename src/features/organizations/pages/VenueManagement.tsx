import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { listVenues, createVenue, deleteVenue } from '../../venues/api/venueApi'
import type { Venue, VenueType } from '../../venues/components/types'
import './TeamManagement.css'

export default function VenueManagement() {
  const navigate = useNavigate()
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [toast, setToast] = useState('')

  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [type, setType] = useState<VenueType>('SEAT_BASED')

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 4000)
  }

  const fetchVenues = useCallback(async () => {
    try {
      setLoading(true)
      const res = await listVenues(0, 100)
      setVenues(res.content)
    } catch {
      setVenues([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchVenues()
  }, [fetchVenues])

  const handleCreate = async () => {
    if (!name.trim() || creating) return
    setCreating(true)
    try {
      await createVenue({ name: name.trim(), address: address.trim(), type })
      setModalOpen(false)
      setName('')
      setAddress('')
      setType('SEAT_BASED')
      showToast('Venue created successfully')
      await fetchVenues()
    } catch (e) {
      showToast('Failed to create venue: ' + (e as Error).message)
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this venue? This cannot be undone.')) return
    try {
      await deleteVenue(id)
      showToast('Venue deleted')
      await fetchVenues()
    } catch (e) {
      showToast('Failed to delete venue: ' + (e as Error).message)
    }
  }

  const goToTemplates = (venueId: string) => {
    navigate(`/org/venue-templates?venueId=${venueId}`)
  }

  const stats = {
    total: venues.length,
    seatBased: venues.filter((v) => v.type === 'SEAT_BASED').length,
    zoneBased: venues.filter((v) => v.type === 'ZONE_BASED').length,
  }

  return (
    <main className="wrap members-page">
      <div className="members-head">
        <h1 className="section-title" style={{ margin: 0 }}>Venues</h1>
        <button className="btn btn-primary btn-sm" onClick={() => setModalOpen(true)}>Add Venue</button>
      </div>

      <div className="stat-chips">
        <div className="stat-chip"><span className="stat-chip-num">{stats.total}</span> Total</div>
        <div className="stat-chip"><span className="stat-chip-num">{stats.seatBased}</span> Seat Based</div>
        <div className="stat-chip"><span className="stat-chip-num">{stats.zoneBased}</span> Zone Based</div>
      </div>

      <div className="card-white" style={{ padding: 0 }}>
        <div className="table-wrap">
          {loading ? (
            <p style={{ padding: 32, textAlign: 'center', color: 'var(--muted)' }}>Loading venues...</p>
          ) : venues.length === 0 ? (
            <p style={{ padding: 32, textAlign: 'center', color: 'var(--muted)' }}>No venues yet. Click "Add Venue" to create one.</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Address</th>
                  <th>Type</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {venues.map((v) => (
                  <tr key={v.id}>
                    <td style={{ fontWeight: 500 }}>{v.name}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{v.address || '—'}</td>
                    <td>
                      <span className={`badge ${v.type === 'SEAT_BASED' ? 'badge-yellow' : 'badge-ink'}`}>
                        {v.type === 'SEAT_BASED' ? 'Seat' : 'Zone'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {v.type === 'SEAT_BASED' && (
                          <button
                            className="btn btn-primary btn-sm"
                            style={{ height: 34, padding: '0 16px', fontSize: 13 }}
                            onClick={() => goToTemplates(v.id)}
                          >
                            Manage Templates
                          </button>
                        )}
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ height: 34, padding: '0 14px', fontSize: 13, color: 'var(--red, #c62828)' }}
                          onClick={() => handleDelete(v.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Add Venue</h2>
            <div className="modal-field">
              <label className="modal-label">Name</label>
              <input
                className="form-input modal-input"
                placeholder="Venue name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="modal-field">
              <label className="modal-label">Address</label>
              <input
                className="form-input modal-input"
                placeholder="Venue address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            <div className="modal-field">
              <label className="modal-label">Type</label>
              <select
                className="form-input modal-input"
                value={type}
                onChange={(e) => setType(e.target.value as VenueType)}
                style={{ cursor: 'pointer' }}
              >
                <option value="SEAT_BASED">Seat Based</option>
                <option value="ZONE_BASED">Zone Based</option>
              </select>
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost btn-sm" onClick={() => setModalOpen(false)}>Cancel</button>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleCreate}
                disabled={!name.trim() || creating}
              >
                {creating ? 'Creating...' : 'Create Venue'}
              </button>
            </div>
          </div>
        </div>
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
    </main>
  )
}
