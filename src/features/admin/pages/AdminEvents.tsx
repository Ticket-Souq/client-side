import { useState } from 'react'
import { EventSearchBar } from '../../events/components/EventSearchBar'
import { EmptyState } from '../../events/components/EmptyState'
import { LoadingSkeleton } from '../../events/components/LoadingSkeleton'
import { StatusBadge } from '../../events/components/StatusBadge'
import { useEvents } from '../../events/hooks/useEvents'
import { formatDate } from '../../events/utils/eventFormatters'
import type { EventFilters, EventCardResponse } from '../../events/types/event.types'

export default function AdminEvents() {
  const [filters, setFilters] = useState<EventFilters>({})
  const [page, setPage] = useState(0)
  const { events, totalElements, totalPages, loading } = useEvents({ filters, page, size: 10 })

  const pendingCount = events.filter((e) => e.status === 'PENDING').length
  const flaggedCount = events.filter((e) => e.status === 'REJECTED').length

  return (
    <div className="wrap oversight-page" style={{ padding: '36px 0' }}>
      <div className="page-title-row" style={{ marginBottom: 28 }}>
        <div>
          <h1 className="section-title" style={{ margin: 0 }}>Event Oversight</h1>
          <p className="section-sub" style={{ margin: '4px 0 0' }}>
            Review, approve, and moderate all events across the platform.
          </p>
        </div>
        <div className="oversight-stats" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span className="stat-chip">{totalElements} Total</span>
          <span className="stat-chip pending-chip">{pendingCount} Pending</span>
          <span className="stat-chip flagged-chip">{flaggedCount} Flagged</span>
        </div>
      </div>

      <EventSearchBar
        searchValue={filters.title ?? ''}
        onSearchChange={(title) => setFilters((prev) => ({ ...prev, title }))}
        category={filters.category ?? ''}
        onCategoryChange={(category) => setFilters((prev) => ({ ...prev, category }))}
        status={filters.status ?? ''}
        onStatusChange={(status) => setFilters((prev) => ({ ...prev, status }))}
        showStatus
        showDateRange={false}
      />

      {loading && <LoadingSkeleton variant="table" count={5} />}

      {!loading && events.length === 0 && (
        <EmptyState
          title="No events found"
          description="There are no events matching your filters."
          icon="🎵"
        />
      )}

      {!loading && events.length > 0 && (
        <>
          <div className="card-white table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Organizer</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event: EventCardResponse) => (
                  <tr key={event.id}>
                    <td><strong>{event.title}</strong></td>
                    <td>{event.organizerName || '—'}</td>
                    <td>{formatDate(event.startDate)}</td>
                    <td><StatusBadge status={event.status as any} /></td>
                    <td>
                      <div className="table-actions">
                        <button className="btn btn-primary btn-sm">Approve</button>
                        <button className="btn btn-ghost btn-sm" style={{ color: 'var(--text-secondary)' }}>Flag</button>
                        <button className="btn btn-danger btn-sm">Remove</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
              <button
                className="btn btn-ghost btn-sm"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                ← Prev
              </button>
              <span className="mono" style={{ fontSize: 13, display: 'flex', alignItems: 'center', color: 'var(--text-secondary)' }}>
                Page {page + 1} of {totalPages}
              </span>
              <button
                className="btn btn-ghost btn-sm"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
