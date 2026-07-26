import { useState, useEffect, useCallback } from 'react'
import { authFetch } from '../../../shared/auth'
import { API } from '../../../shared/api'

type OrgStatus = 'PENDING' | 'APPROVED' | 'BANNED' | 'REJECTED'

interface OrgRow {
  id: string
  name: string
  headEmail: string
  status: OrgStatus
  orgHeadId: string
}

const STATUS_BADGE: Record<OrgStatus, string> = {
  PENDING: 'badge badge-soft',
  APPROVED: 'badge badge-yellow',
  BANNED: 'badge badge-red',
  REJECTED: 'badge badge-ink',
}

const STATUS_LABEL: Record<OrgStatus, string> = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  BANNED: 'Banned',
  REJECTED: 'Rejected',
}

export default function OrganizationsManagement() {
  const [orgs, setOrgs] = useState<OrgRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All statuses')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchOrgs = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await authFetch(API.admin.organizations)
      if (!res.ok) throw new Error('Failed to load organizations')
      const data: OrgRow[] = await res.json()
      setOrgs(data)
    } catch {
      setError('Failed to load organizations')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchOrgs() }, [fetchOrgs])

  const handleAction = async (orgId: string, action: 'approve' | 'reject' | 'ban') => {
    setActionLoading(orgId)
    try {
      const url =
        action === 'approve' ? API.admin.orgApprove(orgId) :
        action === 'reject' ? API.admin.orgReject(orgId) :
        API.admin.orgBan(orgId)
      const res = await authFetch(url, { method: 'POST' })
      if (!res.ok) throw new Error('Action failed')
      await fetchOrgs()
    } catch {
      setError(`Failed to ${action} organization`)
    } finally {
      setActionLoading(null)
    }
  }

  const filtered = orgs.filter((o) => {
    const matchSearch =
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.headEmail.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'All statuses' || o.status === statusFilter
    return matchSearch && matchStatus
  })

  const totalCount = orgs.length
  const pendingCount = orgs.filter((o) => o.status === 'PENDING').length
  const bannedCount = orgs.filter((o) => o.status === 'BANNED').length

  const actionButtons = (org: OrgRow) => {
    const disabled = actionLoading === org.id
    switch (org.status) {
      case 'PENDING':
        return (
          <div className="table-actions">
            <button type="button" className="action-link approve" disabled={disabled} onClick={() => handleAction(org.orgHeadId, 'approve')}>
              {disabled ? '...' : 'Approve'}
            </button>
            <button type="button" className="action-link ban" disabled={disabled} onClick={() => handleAction(org.orgHeadId, 'reject')}>
              {disabled ? '...' : 'Reject'}
            </button>
          </div>
        )
      case 'APPROVED':
        return (
          <div className="table-actions">
            <button type="button" className="action-link ban" disabled={disabled} onClick={() => handleAction(org.orgHeadId, 'ban')}>
              {disabled ? '...' : 'Ban'}
            </button>
          </div>
        )
      case 'BANNED':
        return (
          <div className="table-actions">
            <button type="button" className="action-link approve" disabled={disabled} onClick={() => handleAction(org.orgHeadId, 'approve')}>
              {disabled ? '...' : 'Unban'}
            </button>
          </div>
        )
      case 'REJECTED':
        return (
          <div className="table-actions">
            <button type="button" className="action-link approve" disabled={disabled} onClick={() => handleAction(org.orgHeadId, 'approve')}>
              {disabled ? '...' : 'Approve'}
            </button>
          </div>
        )
    }
  }

  return (
    <div className="wrap oversight-page" style={{ padding: '36px 0' }}>
      <div className="page-head">
        <div>
          <h1 className="section-title" style={{ margin: 0 }}>Organization Management</h1>
          <p className="section-sub" style={{ margin: '4px 0 0' }}>
            Review, approve, and manage all event organizer accounts.
          </p>
        </div>
        <div className="oversight-stats" style={{ display: 'flex', gap: 12, marginTop: 12 }}>
          <span className="stat-chip">{totalCount} Total</span>
          <span className="stat-chip pending-chip">{pendingCount} Pending</span>
          <span className="stat-chip flagged-chip">{bannedCount} Banned</span>
        </div>
      </div>

      <div className="filter-bar" style={{ marginBottom: 24 }}>
        <input
          className="form-input"
          type="search"
          placeholder="Search organizations…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ minWidth: 260 }}
        />
        <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option>All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="BANNED">Banned</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {loading && <p style={{ textAlign: 'center', padding: 32, color: 'var(--text-secondary)' }}>Loading…</p>}
      {error && <p style={{ textAlign: 'center', padding: 32, color: 'var(--color-error)' }}>{error}</p>}

      {!loading && !error && (
        <div className="card-white table-wrap">
          <table className="table" style={{ tableLayout: 'fixed', width: '100%' }}>
            <colgroup>
              <col />
              <col style={{ width: 400 }} />
              <col style={{ width: 200 }} />
              <col style={{ width: 300 }} />
            </colgroup>
            <thead>
              <tr>
                <th>Organization</th>
                <th>Head Email</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((org) => (
                <tr key={org.id}>
                  <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}><strong>{org.name}</strong></td>
                  <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{org.headEmail}</td>
                  <td><span className={STATUS_BADGE[org.status]}>{STATUS_LABEL[org.status]}</span></td>
                  <td>{actionButtons(org)}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: 32, color: 'var(--text-secondary)' }}>
                    No organizations found
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
