import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { listVenues, createVenue, deleteVenue } from '../../venues/api/venueApi'
import type { Venue, VenueType } from '../../venues/components/types'
import { useFetch } from '../../../shared/hooks/useFetch'
import { useConfirm } from '../../../shared/hooks/useConfirm'
import { toast } from '../../../shared/components/display/Toast/Toast'
import { PageHeader } from '../../../shared/components/layout/PageHeader/PageHeader'
import { StatChips } from '../../../shared/components/display/StatChips/StatChips'
import { LoadingState, EmptyState } from '../../../shared/components/display/StateViews/StateViews'
import './TeamManagement.css'

export default function VenueManagement() {
  const navigate = useNavigate()
  const { data, loading, refresh } = useFetch<Venue[]>(async () => (await listVenues(0, 100)).content, '')
  const venues = data ?? []
  const [modalOpen, setModalOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const { confirm, dialog } = useConfirm()

  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [type, setType] = useState<VenueType>('SEAT_BASED')

  const handleCreate = async () => {
    if (!name.trim() || creating) return
    setCreating(true)
    try {
      await createVenue({ name: name.trim(), address: address.trim(), type })
      setModalOpen(false)
      setName('')
      setAddress('')
      setType('SEAT_BASED')
      toast('Venue created successfully', 'success')
      await refresh()
    } catch (e) {
      toast('Failed to create venue: ' + (e as Error).message, 'error')
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!(await confirm('Delete this venue? This cannot be undone.', { confirmLabel: 'Delete', danger: true }))) return
    try {
      await deleteVenue(id)
      toast('Venue deleted', 'success')
      await refresh()
    } catch (e) {
      toast('Failed to delete venue: ' + (e as Error).message, 'error')
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
      <PageHeader
        title="Venues"
        className="members-head"
        actions={
          <button className="btn btn-primary btn-sm" onClick={() => setModalOpen(true)}>Add Venue</button>
        }
      />

      <StatChips
        items={[
          { label: 'Total', value: stats.total },
          { label: 'Seat Based', value: stats.seatBased },
          { label: 'Zone Based', value: stats.zoneBased },
        ]}
      />

      <div className="card-white" style={{ padding: 0 }}>
        <div className="table-wrap">
          {loading ? (
            <LoadingState message="Loading venues..." />
          ) : venues.length === 0 ? (
            <EmptyState message='No venues yet. Click "Add Venue" to create one.' />
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
                          style={{ height: 34, padding: '0 14px', fontSize: 13, color: 'var(--red)' }}
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

      {dialog}
    </main>
  )
}
