import { useState } from 'react'
import { EventApi } from '../../events/services/eventApi'
import { PageHeader } from '../../../shared/components/layout/PageHeader/PageHeader'
import { StatChips } from '../../../shared/components/display/StatChips/StatChips'
import { StatusBadge, type StatusBadgeOption } from '../../../shared/components/display/StatusBadge/StatusBadge'
import { LoadingState, ErrorState } from '../../../shared/components/display/StateViews/StateViews'
import { useFetch } from '../../../shared/hooks/useFetch'
import { useConfirm } from '../../../shared/hooks/useConfirm'
import { toast } from '../../../shared/components/display/Toast/Toast'
import { formatDateTime } from '../../../shared/format'
import { API } from '../../../shared/api'
import type { EventCardResponse, PaginatedResponse } from '../../events/types/event.types'

const STATUS_OPTIONS: Record<string, StatusBadgeOption> = {
  PUBLISHED: { label: 'Published', variant: 'green' },
  ACTIVE: { label: 'Active', variant: 'green' },
  COMPLETED: { label: 'Completed', variant: 'soft' },
  CANCELLED: { label: 'Cancelled', variant: 'red' },
}

const PAGE_SIZE = 20

export default function EventsManagement() {
  const [page, setPage] = useState(0)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const { confirm, dialog } = useConfirm()

  const { data, loading, error, refresh } = useFetch<PaginatedResponse<EventCardResponse>>(
    () => EventApi.list(page, PAGE_SIZE),
    'Failed to load events',
    [page],
  )

  const events = data?.content ?? []
  const totalElements = data?.totalElements ?? 0
  const totalPages = data?.totalPages ?? 0

  const handleCancel = async (event: EventCardResponse) => {
    if (!(await confirm(
      <>Cancel the event <strong>{event.title}</strong>? Customers will no longer see it and existing bookings will be invalidated.</>,
      { title: 'Cancel event', confirmLabel: 'Cancel event', danger: true },
    ))) return

    setCancellingId(event.id)
    try {
      await EventApi.cancel(event.id)
      toast('Event cancelled', 'success')
      if (events.length === 1 && page > 0) {
        setPage((p) => p - 1)
      } else {
        await refresh()
      }
    } catch (err) {
      toast(err instanceof Error && err.message ? err.message : 'Failed to cancel event')
    } finally {
      setCancellingId(null)
    }
  }

  const publishedCount = events.filter((e) => e.status === 'PUBLISHED').length
  const activeCount = events.filter((e) => e.status === 'ACTIVE').length

  return (
    <div className="wrap oversight-page">
      <PageHeader
        title="Events"
        subtitle="All published and live events. Cancel any event to remove it from the platform."
        actions={
          <StatChips
            items={[
              { label: 'Total', value: totalElements },
              { label: 'Published', value: publishedCount, tone: 'pending' },
              { label: 'Live', value: activeCount, tone: 'flagged' },
            ]}
            style={{ margin: 0 }}
          />
        }
      />

      {loading && <LoadingState />}
      {error && <ErrorState message={error} />}

      {!loading && !error && (
        <div className="card-white table-wrap">
          <table className="table" style={{ tableLayout: 'fixed', width: '100%' }}>
            <colgroup>
              <col style={{ width: 64 }} />
              <col />
              <col style={{ width: 220 }} />
              <col style={{ width: 160 }} />
              <col style={{ width: 200 }} />
              <col style={{ width: 140 }} />
              <col style={{ width: 160 }} />
            </colgroup>
            <thead>
              <tr>
                <th>Poster</th>
                <th>Event</th>
                <th>Location</th>
                <th>Category</th>
                <th>Starts</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id}>
                  <td>
                    {event.posterUrl ? (
                      <img
                        src={`${API.base}${event.posterUrl}`}
                        alt=""
                        style={{ width: 40, height: 56, objectFit: 'cover', borderRadius: 6, display: 'block' }}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                      />
                    ) : (
                      <div style={{ width: 40, height: 56, borderRadius: 6, background: 'var(--border)' }} />
                    )}
                  </td>
                  <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <strong>{event.title}</strong>
                  </td>
                  <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{event.location || '—'}</td>
                  <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{event.categoryName || '—'}</td>
                  <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{formatDateTime(event.startDate)}</td>
                  <td><StatusBadge status={event.status} options={STATUS_OPTIONS} fallback={{ label: event.status, variant: 'soft' }} /></td>
                  <td>
                    {event.status === 'PUBLISHED' ? (
                      <div className="table-actions">
                        <button
                          type="button"
                          className="action-link ban"
                          disabled={cancellingId === event.id}
                          onClick={() => handleCancel(event)}
                        >
                          {cancellingId === event.id ? 'Cancelling…' : 'Cancel Event'}
                        </button>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
              {events.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 32, color: 'var(--text-secondary)' }}>
                    No events found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && totalPages > 1 && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 24 }}>
          <button className="btn btn-ghost btn-sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Previous</button>
          <span style={{ alignSelf: 'center', fontSize: 14, color: 'var(--text-secondary)' }}>
            Page {page + 1} of {totalPages}
          </span>
          <button className="btn btn-ghost btn-sm" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>Next</button>
        </div>
      )}

      {dialog}
    </div>
  )
}
