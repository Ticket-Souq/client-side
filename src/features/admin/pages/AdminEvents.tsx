import { useState } from 'react'
import { EventSearchBar } from '../../events/components/EventSearchBar'
import { EventTable } from '../../events/components/EventTable'
import { EmptyState } from '../../events/components/EmptyState'
import { LoadingSkeleton } from '../../events/components/LoadingSkeleton'
import { useEvents } from '../../events/hooks/useEvents'
import type { EventFilters } from '../../events/types/event.types'

export default function AdminEvents() {
  const [filters, setFilters] = useState<EventFilters>({})
  const [page, setPage] = useState(0)
  const { events, totalElements, totalPages, loading } = useEvents({ filters, page, size: 10 })

  return (
    <div className="events-wrap" style={{ padding: '41px 36px 69px' }}>
      <div className="events-page-title-row">
        <div>
          <h1 className="events-page-title">All Events</h1>
          <p className="events-page-sub">View and manage all events across the platform</p>
        </div>
      </div>

      <div className="events-stat-chips" style={{ marginBottom: 24 }}>
        <div className="events-stat-chip">
          <span className="num">{totalElements}</span> total
        </div>
        <div className="events-stat-chip">
          <span className="num">{events.filter((e) => e.status === 'PUBLISHED').length}</span> published
        </div>
        <div className="events-stat-chip">
          <span className="num">{events.filter((e) => e.status === 'PENDING').length}</span> pending
        </div>
        <div className="events-stat-chip">
          <span className="num">{events.filter((e) => e.status === 'CANCELLED').length}</span> cancelled
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
          <EventTable events={events} />

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
              <button
                className="events-zone"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                style={{ padding: '8px 16px', fontSize: 14 }}
              >
                ← Prev
              </button>
              <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 13, display: 'flex', alignItems: 'center' }}>
                Page {page + 1} of {totalPages}
              </span>
              <button
                className="events-zone"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                style={{ padding: '8px 16px', fontSize: 14 }}
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
