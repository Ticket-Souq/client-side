import { useState } from 'react'
import { request } from '../../../shared/http'
import { API } from '../../../shared/api'
import { useFetch } from '../../../shared/hooks/useFetch'
import { PageHeader } from '../../../shared/components/layout/PageHeader/PageHeader'
import { StatChips } from '../../../shared/components/display/StatChips/StatChips'
import { StatusBadge, type StatusBadgeOption } from '../../../shared/components/display/StatusBadge/StatusBadge'
import { LoadingState, ErrorState } from '../../../shared/components/display/StateViews/StateViews'

type OrgStatus = 'PENDING' | 'APPROVED' | 'BANNED' | 'REJECTED'

interface OrgRow {
  id: string
  name: string
  headEmail: string
  status: OrgStatus
  orgHeadId: string
}

const ORG_STATUS_OPTIONS: Record<string, StatusBadgeOption> = {
  PENDING: { label: 'Pending', variant: 'soft' },
  APPROVED: { label: 'Approved', variant: 'yellow' },
  BANNED: { label: 'Banned', variant: 'red' },
  REJECTED: { label: 'Rejected', variant: 'ink' },
}

export default function OrganizationsManagement() {
  const { data, loading, error, refresh } = useFetch<OrgRow[]>(
    () => request<OrgRow[]>(API.admin.organizations),
    'Failed to load organizations',
  )
  const orgs = data ?? []
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All statuses')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const handleAction = async (orgId: string, action: 'approve' | 'reject' | 'ban') => {
    setActionLoading(orgId)
    setActionError(null)
    try {
      const url =
        action === 'approve' ? API.admin.orgApprove(orgId) :
        action === 'reject' ? API.admin.orgReject(orgId) :
        API.admin.orgBan(orgId)
      await request(url, { method: 'POST' })
      await refresh()
    } catch {
      setActionError(`Failed to ${action} organization`)
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
    <div className="wrap oversight-page">
      <PageHeader
        title="Organization Management"
        subtitle="Review, approve, and manage all event organizer accounts."
        actions={
          <StatChips
            items={[
              { label: 'Total', value: totalCount },
              { label: 'Pending', value: pendingCount, tone: 'pending' },
              { label: 'Banned', value: bannedCount, tone: 'flagged' },
            ]}
            style={{ margin: 0 }}
          />
        }
      />

      <div className="filter-bar" style={{ marginBottom: 24 }}>
        <input
          className="form-input"
          type="search"
          placeholder="Search organizations…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option>All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="BANNED">Banned</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {loading && <LoadingState />}
      {(error || actionError) && <ErrorState message={(error ?? actionError) ?? 'Something went wrong'} />}

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
                  <td><StatusBadge status={org.status} options={ORG_STATUS_OPTIONS} /></td>
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
