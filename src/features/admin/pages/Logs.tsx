import { useState, useEffect, useCallback } from 'react'
import { authFetch } from '../../../shared/auth'
import { API } from '../../../shared/api'

interface AuditLog {
  id: string
  action: string
  madeById: string
  reason: string
  madeAt: string
}

interface MemberSummary {
  id: string
  email: string
}

export default function Logs() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [memberEmails, setMemberEmails] = useState<Record<string, string>>({})

  const [actionFilter, setActionFilter] = useState('')
  const [madeByIdFilter, setMadeByIdFilter] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      let url = API.admin.auditLogs
      const params = new URLSearchParams()
      if (madeByIdFilter.trim()) params.set('madeById', madeByIdFilter.trim())
      else if (actionFilter.trim()) params.set('action', actionFilter.trim())
      else if (fromDate && toDate) {
        params.set('from', new Date(fromDate).toISOString())
        params.set('to', new Date(toDate).toISOString())
      }
      const qs = params.toString()
      if (qs) url += '?' + qs

      const res = await authFetch(url)
      if (!res.ok) throw new Error('Failed to load audit logs')
      const data: AuditLog[] = await res.json()
      setLogs(data)

      const uniqueIds = [...new Set(data.map(l => l.madeById).filter(Boolean))]
      if (uniqueIds.length > 0) {
        try {
          const memberRes = await authFetch(API.users.membersBatch, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(uniqueIds),
          })
          if (memberRes.ok) {
            const members: MemberSummary[] = await memberRes.json()
            setMemberEmails(Object.fromEntries(members.map(m => [m.id, m.email])))
          }
        } catch { /* keep UUIDs as fallback */ }
      }
    } catch {
      setError('Failed to load audit logs')
    } finally {
      setLoading(false)
    }
  }, [actionFilter, madeByIdFilter, fromDate, toDate])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  const clearFilters = () => {
    setActionFilter('')
    setMadeByIdFilter('')
    setFromDate('')
    setToDate('')
  }

  const hasFilters = actionFilter || madeByIdFilter || (fromDate && toDate)

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
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', fontFamily: "'IBM Plex Mono', monospace", letterSpacing: '0.05em', textTransform: 'uppercase' }}>Made By (ID)</label>
          <input
            className="form-input"
            type="text"
            placeholder="UUID"
            value={madeByIdFilter}
            onChange={(e) => setMadeByIdFilter(e.target.value)}
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
              <col style={{ width: 220 }} />
              <col style={{ width: 280 }} />
              <col />
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
              {logs.map((log) => (
                <tr key={log.id}>
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
                    {memberEmails[log.madeById] || log.madeById}
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
