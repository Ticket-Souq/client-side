import { useState } from 'react'
import { request } from '../../../shared/http'
import { API } from '../../../shared/api'
import { useFetch } from '../../../shared/hooks/useFetch'
import { formatDateTime } from '../../../shared/format'
import { PageHeader } from '../../../shared/components/layout/PageHeader/PageHeader'
import { LoadingState, ErrorState } from '../../../shared/components/display/StateViews/StateViews'

interface AuditLog {
  action: string
  madeByEmail: string
  reason: string
  madeAt: string
}

export default function Logs() {
  const [actionFilter, setActionFilter] = useState('')
  const [madeByFilter, setMadeByFilter] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  const { data, loading, error } = useFetch<AuditLog[]>(
    async () => {
      let url = API.admin.auditLogs
      const params = new URLSearchParams()
      if (fromDate && toDate) {
        params.set('from', new Date(fromDate).toISOString())
        params.set('to', new Date(toDate).toISOString())
      }
      const qs = params.toString()
      if (qs) url += '?' + qs
      return request<AuditLog[]>(url)
    },
    'Failed to load audit logs',
    [fromDate, toDate],
  )

  const logs = (data ?? []).filter(log => {
    if (actionFilter.trim() && !log.action.toLowerCase().includes(actionFilter.trim().toLowerCase())) return false
    if (madeByFilter.trim() && !log.madeByEmail.toLowerCase().includes(madeByFilter.trim().toLowerCase())) return false
    return true
  })

  const clearFilters = () => {
    setActionFilter('')
    setMadeByFilter('')
    setFromDate('')
    setToDate('')
  }

  const hasFilters = actionFilter || madeByFilter || (fromDate && toDate)

  return (
    <div className="wrap oversight-page">
      <PageHeader
        title="Audit Logs"
        subtitle="Track all admin and system actions across the platform."
      />

      <div className="filter-bar" style={{ marginBottom: 24, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', fontFamily: "'IBM Plex Mono', monospace", letterSpacing: '0.05em', textTransform: 'uppercase' }}>Action</label>
          <input
            className="form-input"
            type="text"
            placeholder="e.g. USER_BANNED"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            style={{ height: 40, fontSize: 14, minWidth: 180 }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', fontFamily: "'IBM Plex Mono', monospace", letterSpacing: '0.05em', textTransform: 'uppercase' }}>Made By</label>
          <input
            className="form-input"
            type="text"
            placeholder="Search by email…"
            value={madeByFilter}
            onChange={(e) => setMadeByFilter(e.target.value)}
            style={{ height: 40, fontSize: 14 }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', fontFamily: "'IBM Plex Mono', monospace", letterSpacing: '0.05em', textTransform: 'uppercase' }}>From</label>
          <input
            className="form-input"
            type="datetime-local"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            style={{ height: 40, fontSize: 14, minWidth: 200 }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', fontFamily: "'IBM Plex Mono', monospace", letterSpacing: '0.05em', textTransform: 'uppercase' }}>To</label>
          <input
            className="form-input"
            type="datetime-local"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            style={{ height: 40, fontSize: 14, minWidth: 200 }}
          />
        </div>
        {hasFilters && (
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={clearFilters}
            style={{ height: 40, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            Clear filters
          </button>
        )}
      </div>

      {loading && <LoadingState />}
      {error && <ErrorState message={error} />}

      {!loading && !error && (
        <div className="card-white table-wrap">
          <table className="table" style={{ tableLayout: 'fixed', width: '100%' }}>
            <colgroup>
              <col style={{ width: 450 }} />
              <col style={{ width: 200 }} />
              <col style={{ width: 200 }} />
              <col style={{ width: 200 }} />
            </colgroup>
            <thead>
              <tr>
                <th>Action</th>
                <th>Made By</th>
                <th>Reason</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, i) => (
                <tr key={i}>
                  <td>
                    <span style={{
                      display: 'inline-block',
                      padding: '3px 10px',
                      borderRadius: 4,
                      fontSize: 11,
                      fontWeight: 600,
                      fontFamily: "'IBM Plex Mono', monospace",
                      letterSpacing: '0.04em',
                      background: 'var(--yellow-pale)',
                      color: 'var(--yellow-deep)',
                    }}>
                      {log.action}
                    </span>
                  </td>
                  <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 14 }}>
                    {log.madeByEmail}
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{log.reason}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                    {formatDateTime(log.madeAt)}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: 32, color: 'var(--text-secondary)' }}>
                    No audit logs found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
