import { useState, useEffect, useCallback } from 'react'
import { authFetch } from '../../../shared/auth'
import { API } from '../../../shared/api'

interface AuditLog {
  action: string
  madeByEmail: string
  reason: string
  madeAt: string
}

export default function Logs() {
  const [allLogs, setAllLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [actionFilter, setActionFilter] = useState('')
  const [madeByFilter, setMadeByFilter] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      let url = API.admin.auditLogs
      const params = new URLSearchParams()
      if (fromDate && toDate) {
        params.set('from', new Date(fromDate).toISOString())
        params.set('to', new Date(toDate).toISOString())
      }
      const qs = params.toString()
      if (qs) url += '?' + qs

      const res = await authFetch(url)
      if (!res.ok) throw new Error('Failed to load audit logs')
      const data: AuditLog[] = await res.json()
      setAllLogs(data)
    } catch {
      setError('Failed to load audit logs')
    } finally {
      setLoading(false)
    }
  }, [fromDate, toDate])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  const logs = allLogs.filter(log => {
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
    <div className="wrap oversight-page" style={{ padding: '36px 0' }}>
      <div className="page-head">
        <div>
          <h1 className="section-title" style={{ margin: 0 }}>Audit Logs</h1>
          <p className="section-sub" style={{ margin: '4px 0 0' }}>
            Track all admin and system actions across the platform.
          </p>
        </div>
      </div>

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
            style={{ height: 40, fontSize: 14, minWidth: 260 }}
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

      {loading && <p style={{ textAlign: 'center', padding: 32, color: 'var(--text-secondary)' }}>Loading…</p>}
      {error && <p style={{ textAlign: 'center', padding: 32, color: '#c62828' }}>{error}</p>}

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
                      background: 'var(--yellow-pale, #fff6d9)',
                      color: 'var(--yellow-deep, #e0a600)',
                    }}>
                      {log.action}
                    </span>
                  </td>
                  <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 14 }}>
                    {log.madeByEmail}
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{log.reason}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                    {new Date(log.madeAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
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
