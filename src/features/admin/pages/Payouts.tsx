import React, { useState, useEffect, useCallback } from 'react'
import { request } from '../../../shared/http'
import { API } from '../../../shared/api'
import { useFetch } from '../../../shared/hooks/useFetch'
import { PageHeader } from '../../../shared/components/layout/PageHeader/PageHeader'
import { StatChips } from '../../../shared/components/display/StatChips/StatChips'
import { StatusBadge, type StatusBadgeOption } from '../../../shared/components/display/StatusBadge/StatusBadge'
import { LoadingState, ErrorState } from '../../../shared/components/display/StateViews/StateViews'
import { useConfirm } from '../../../shared/hooks/useConfirm'
import { toast } from '../../../shared/components/display/Toast/Toast'
import { formatDateTime } from '../../../shared/format'

type PayoutStatus = 'COMPLETED' | 'PENDING' | 'FAILED'

interface PayoutInfo {
  id: string
  status: PayoutStatus
  providerTransferId: string | null
  transferId?: string | null
  createdAt: string
}

interface PayoutEventRow {
  eventId: string
  owed: number
  paid: number
  payout: PayoutInfo | null
}

interface OrgPayoutRow {
  organization: string
  owed: number
  paid: number
  outstanding: number
  eventCount: number
  payoutCount: number
  events: PayoutEventRow[]
}

interface DashboardResponse {
  totalOwed: number
  totalPaid: number
  totalOutstanding: number
  orgs: OrgPayoutRow[]
}

interface PayoutRecord {
  id?: string
  organization: string
  eventId: string
  amount: number
  netAmount: number
  status: PayoutStatus
  providerTransferId: string | null
  transferId?: string | null
  createdAt: string
}

interface SpringPage<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

interface PayOrgResponse {
  created: number
  skipped: number
  failed: number
  payouts: PayoutRecord[]
}

const PAYOUT_STATUS_OPTIONS: Record<string, StatusBadgeOption> = {
  COMPLETED: { label: 'Completed', variant: 'green' },
  PENDING: { label: 'Pending', variant: 'yellow' },
  FAILED: { label: 'Failed', variant: 'red' },
}

function fmt(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined) return '0.00'
  const n = typeof amount === 'string' ? Number(amount) : amount
  if (Number.isNaN(n)) return '0.00'
  return n.toFixed(2)
}

function truncateId(id: string): string {
  if (!id) return '—'
  return id.length > 8 ? `${id.slice(0, 8)}…` : id
}

function getTransferId(payout: PayoutInfo | PayoutRecord | null | undefined): string {
  if (!payout) return '—'
  const tid = (payout as PayoutInfo).providerTransferId ?? (payout as PayoutInfo).transferId ?? (payout as PayoutRecord).providerTransferId ?? (payout as PayoutRecord).transferId
  return tid ? String(tid) : '—'
}

function Spinner() {
  return (
    <span
      style={{
        display: 'inline-block',
        width: 12,
        height: 12,
        border: '2px solid currentColor',
        borderTopColor: 'transparent',
        borderRadius: '50%',
        animation: 'payout-spin 0.6s linear infinite',
        verticalAlign: 'middle',
        marginRight: 6,
      }}
    />
  )
}

export default function Payouts() {
  const [view, setView] = useState<'dashboard' | 'records'>('dashboard')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [payingOrg, setPayingOrg] = useState<string | null>(null)
  const [payingEvent, setPayingEvent] = useState<string | null>(null)
  const [recordsPage, setRecordsPage] = useState(0)
  const { confirm, dialog } = useConfirm()

  // debounce searchInput -> search
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim())
    }, 400)
    return () => clearTimeout(t)
  }, [searchInput])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput.trim())
  }

  const {
    data: dashboardData,
    loading: dashboardLoading,
    error: dashboardError,
    refresh: refreshDashboard,
  } = useFetch<DashboardResponse>(
    () => request<DashboardResponse>(API.payout.dashboard(search)),
    'Failed to load payouts',
    [search],
  )

  const {
    data: recordsData,
    loading: recordsLoading,
    error: recordsError,
    refresh: refreshRecords,
  } = useFetch<SpringPage<PayoutRecord>>(
    () => {
      const url = API.payout.records
      return request<SpringPage<PayoutRecord>>(url, {
        query: { page: recordsPage, size: 20 },
      })
    },
    'Failed to load payout records',
    [recordsPage, view],
  )

  const toggleExpand = useCallback((orgName: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(orgName)) next.delete(orgName)
      else next.add(orgName)
      return next
    })
  }, [])

  const copyId = useCallback(async (id: string) => {
    try {
      await navigator.clipboard.writeText(id)
      toast('Copied', 'success')
    } catch {
      toast('Copy failed', 'error')
    }
  }, [])

  const handlePayOrg = useCallback(async (org: OrgPayoutRow) => {
    const outstandingEvents = org.events.filter((ev) => ev.payout?.status !== 'COMPLETED').length
    const count = outstandingEvents > 0 ? outstandingEvents : org.eventCount
    const confirmed = await confirm(`Pay all outstanding for ${org.organization}? This will process ${count} event(s).`, {
      title: 'Confirm payout',
      confirmLabel: 'Pay',
      cancelLabel: 'Cancel',
      danger: false,
    })
    if (!confirmed) return
    setPayingOrg(org.organization)
    try {
      await request<PayOrgResponse>(API.payout.payOrganization(org.organization), { method: 'POST' })
      toast(`Payout processed for ${org.organization}`, 'success')
      await refreshDashboard()
      if (view === 'records') await refreshRecords()
    } catch (err) {
      const reason = err instanceof Error ? err.message : 'Unknown error'
      toast(`Payout failed: ${reason}`, 'error')
    } finally {
      setPayingOrg(null)
    }
  }, [confirm, refreshDashboard, refreshRecords, view])

  const handlePayEvent = useCallback(async (eventId: string, organization?: string) => {
    setPayingEvent(eventId)
    try {
      const url = API.payout.payEvent(eventId)
      const query = organization ? { organization } : undefined
      await request(url, { method: 'POST', query })
      const short = truncateId(eventId).replace('…', '')
      toast(`Payout processed for ${organization ?? short}`, 'success')
      await refreshDashboard()
      if (view === 'records') await refreshRecords()
    } catch (err) {
      const reason = err instanceof Error ? err.message : 'Unknown error'
      toast(`Payout failed: ${reason}`, 'error')
    } finally {
      setPayingEvent(null)
    }
  }, [refreshDashboard, refreshRecords, view])

  const handleRetryRecord = useCallback(async (record: PayoutRecord) => {
    await handlePayEvent(record.eventId, record.organization)
  }, [handlePayEvent])

  const totalOwed = dashboardData?.totalOwed ?? 0
  const totalPaid = dashboardData?.totalPaid ?? 0
  const totalOutstanding = dashboardData?.totalOutstanding ?? 0
  const orgs = dashboardData?.orgs ?? []

  const isAnyPaying = payingOrg !== null || payingEvent !== null

  const records = recordsData?.content ?? []
  const totalPages = recordsData?.totalPages ?? 0

  return (
    <div className="wrap oversight-page">
      <style>{`@keyframes payout-spin { to { transform: rotate(360deg); } }`}</style>
      <PageHeader
        title="Payout Dashboard"
        subtitle="Organization-level payouts, outstanding balances and transfer status."
        actions={
          <StatChips
            items={[
              { label: 'Total Owed', value: fmt(totalOwed) },
              { label: 'Total Paid', value: fmt(totalPaid), tone: 'pending' },
              { label: 'Outstanding', value: fmt(totalOutstanding), tone: 'flagged' },
            ]}
            style={{ margin: 0 }}
          />
        }
      />

      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <button
          type="button"
          className={`btn ${view === 'dashboard' ? 'btn-primary' : 'btn-ghost'} btn-sm`}
          onClick={() => setView('dashboard')}
          style={{ cursor: 'pointer' }}
        >
          Dashboard
        </button>
        <button
          type="button"
          className={`btn ${view === 'records' ? 'btn-primary' : 'btn-ghost'} btn-sm`}
          onClick={() => setView('records')}
          style={{ cursor: 'pointer' }}
        >
          Records
        </button>
      </div>

      {view === 'dashboard' && (
        <>
          <form className="filter-bar" onSubmit={handleSearchSubmit} style={{ marginBottom: 24 }}>
            <input
              className="form-input"
              type="search"
              placeholder="Search organizations…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={{ minWidth: 260 }}
            />
            <button type="submit" className="btn btn-ghost btn-sm" style={{ cursor: 'pointer', height: 40 }}>
              Search
            </button>
          </form>

          {dashboardLoading && <LoadingState />}
          {dashboardError && <ErrorState message={dashboardError} />}

          {!dashboardLoading && !dashboardError && (
            <div className="card-white table-wrap">
              <table className="table" style={{ tableLayout: 'fixed', width: '100%' }}>
                <colgroup>
                  <col style={{ width: 36 }} />
                  <col />
                  <col style={{ width: 90 }} />
                  <col style={{ width: 130 }} />
                  <col style={{ width: 130 }} />
                  <col style={{ width: 130 }} />
                  <col style={{ width: 150 }} />
                </colgroup>
                <thead>
                  <tr>
                    <th></th>
                    <th>Organization Name</th>
                    <th>Events</th>
                    <th>Total Owed</th>
                    <th>Total Paid</th>
                    <th>Outstanding</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orgs.map((org) => {
                    const isExpanded = expanded.has(org.organization)
                    const isPayingThisOrg = payingOrg === org.organization
                    const payTotalDisabled = Number(org.outstanding) === 0 || isAnyPaying
                    return (
                      <React.Fragment key={org.organization}>
                        <tr>
                          <td style={{ textAlign: 'center', paddingRight: 4 }}>
                            <button
                              type="button"
                              onClick={() => toggleExpand(org.organization)}
                              aria-label={isExpanded ? 'Collapse' : 'Expand'}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: 14,
                                lineHeight: 1,
                                color: 'var(--text-secondary)',
                                padding: 4,
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 20,
                                height: 20,
                              }}
                            >
                              <span style={{ display: 'inline-block', transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 150ms ease' }}>▸</span>
                            </button>
                          </td>
                          <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <button
                              type="button"
                              onClick={() => toggleExpand(org.organization)}
                              style={{
                                background: 'none',
                                border: 'none',
                                padding: 0,
                                cursor: 'pointer',
                                fontWeight: 600,
                                fontSize: 14,
                                color: 'var(--ink)',
                                textAlign: 'left',
                                fontFamily: 'inherit',
                              }}
                              title={org.organization}
                            >
                              {org.organization}
                            </button>
                          </td>
                          <td>{org.eventCount}</td>
                          <td>{fmt(org.owed)}</td>
                          <td>{fmt(org.paid)}</td>
                          <td style={{ fontWeight: 600, color: Number(org.outstanding) > 0 ? 'var(--warning-bright)' : 'var(--ink)' }}>{fmt(org.outstanding)}</td>
                          <td>
                            <div className="table-actions">
                              <button
                                type="button"
                                className="btn btn-primary btn-sm"
                                disabled={payTotalDisabled}
                                onClick={() => handlePayOrg(org)}
                                style={{
                                  cursor: payTotalDisabled ? 'not-allowed' : 'pointer',
                                  opacity: payTotalDisabled ? 0.6 : 1,
                                  fontSize: 13,
                                  height: 32,
                                  padding: '0 14px',
                                  borderRadius: 6,
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {isPayingThisOrg && <Spinner />}
                                {isPayingThisOrg ? 'Paying…' : 'Pay Total'}
                              </button>
                            </div>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr key={`${org.organization}__expanded`}>
                            <td colSpan={7} style={{ padding: 0, background: 'var(--surface-soft)', borderBottom: '1px solid var(--border)' }}>
                              <div style={{ padding: '12px 16px 12px 36px' }}>
                                <div className="table-wrap" style={{ background: 'var(--white)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', overflow: 'hidden' }}>
                                  <table className="table" style={{ tableLayout: 'fixed', width: '100%', margin: 0 }}>
                                    <colgroup>
                                      <col style={{ width: 200 }} />
                                      <col style={{ width: 120 }} />
                                      <col style={{ width: 120 }} />
                                      <col style={{ width: 140 }} />
                                      <col />
                                      <col style={{ width: 140 }} />
                                    </colgroup>
                                    <thead>
                                      <tr>
                                        <th style={{ fontSize: 11 }}>Event ID</th>
                                        <th style={{ fontSize: 11 }}>Owed</th>
                                        <th style={{ fontSize: 11 }}>Paid</th>
                                        <th style={{ fontSize: 11 }}>Status</th>
                                        <th style={{ fontSize: 11 }}>Transfer ID</th>
                                        <th style={{ fontSize: 11 }}>Action</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {org.events.length === 0 && (
                                        <tr>
                                          <td colSpan={6} style={{ textAlign: 'center', padding: 20, color: 'var(--text-secondary)', fontSize: 13 }}>
                                            No events for this organization
                                          </td>
                                        </tr>
                                      )}
                                      {org.events.map((ev) => {
                                        const status = ev.payout?.status ?? 'PENDING'
                                        const transferId = getTransferId(ev.payout)
                                        const isPayingThisEvent = payingEvent === ev.eventId
                                        const payEventDisabled = status === 'COMPLETED' || isAnyPaying
                                        return (
                                          <tr key={ev.eventId}>
                                            <td style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13 }}>
                                              <span
                                                style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
                                                title={ev.eventId}
                                              >
                                                <span style={{ cursor: 'default' }}>{truncateId(ev.eventId)}</span>
                                                <button
                                                  type="button"
                                                  onClick={() => copyId(ev.eventId)}
                                                  title={`Copy full ID: ${ev.eventId}`}
                                                  aria-label="Copy event ID"
                                                  style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    padding: 2,
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    color: 'var(--text-secondary)',
                                                  }}
                                                >
                                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v3" />
                                                  </svg>
                                                </button>
                                              </span>
                                            </td>
                                            <td style={{ fontSize: 13 }}>{fmt(ev.owed)}</td>
                                            <td style={{ fontSize: 13 }}>{fmt(ev.paid)}</td>
                                            <td>
                                              <StatusBadge status={status} options={PAYOUT_STATUS_OPTIONS} fallback={{ label: status, variant: 'soft' }} />
                                            </td>
                                            <td style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }} title={transferId !== '—' ? transferId : undefined}>
                                              {transferId}
                                            </td>
                                            <td>
                                              <div className="table-actions">
                                                <button
                                                  type="button"
                                                  className="btn btn-ghost btn-sm"
                                                  disabled={payEventDisabled}
                                                  onClick={() => handlePayEvent(ev.eventId, org.organization)}
                                                  style={{
                                                    cursor: payEventDisabled ? 'not-allowed' : 'pointer',
                                                    opacity: payEventDisabled ? 0.5 : 1,
                                                    fontSize: 12,
                                                    height: 30,
                                                    padding: '0 12px',
                                                    border: '1px solid var(--border)',
                                                    borderRadius: 6,
                                                    background: payEventDisabled ? 'var(--surface-muted)' : 'var(--white)',
                                                    whiteSpace: 'nowrap',
                                                  }}
                                                >
                                                  {isPayingThisEvent && <Spinner />}
                                                  {isPayingThisEvent ? 'Paying…' : 'Pay Event'}
                                                </button>
                                              </div>
                                            </td>
                                          </tr>
                                        )
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    )
                  })}
                  {orgs.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: 32, color: 'var(--text-secondary)' }}>
                        No organizations found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {view === 'records' && (
        <>
          {recordsLoading && <LoadingState />}
          {recordsError && <ErrorState message={recordsError} />}

          {!recordsLoading && !recordsError && (
            <div className="card-white table-wrap">
              <table className="table" style={{ tableLayout: 'fixed', width: '100%' }}>
                <colgroup>
                  <col style={{ width: 160 }} />
                  <col style={{ width: 150 }} />
                  <col style={{ width: 110 }} />
                  <col style={{ width: 110 }} />
                  <col style={{ width: 130 }} />
                  <col style={{ width: 170 }} />
                  <col style={{ width: 170 }} />
                  <col style={{ width: 100 }} />
                </colgroup>
                <thead>
                  <tr>
                    <th>Organization</th>
                    <th>Event ID</th>
                    <th>Amount</th>
                    <th>Net Amount</th>
                    <th>Status</th>
                    <th>Transfer ID</th>
                    <th>Created At</th>
                    <th>Retry</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((rec) => {
                    const transferId = getTransferId(rec)
                    const isPayingThisEvent = payingEvent === rec.eventId
                    const retryDisabled = rec.status === 'COMPLETED' || isAnyPaying
                    return (
                      <tr key={`${rec.id ?? rec.eventId}-${rec.createdAt}`}>
                        <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13 }} title={rec.organization}>
                          {rec.organization}
                        </td>
                        <td style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12 }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }} title={rec.eventId}>
                            <span>{truncateId(rec.eventId)}</span>
                            <button
                              type="button"
                              onClick={() => copyId(rec.eventId)}
                              title={`Copy: ${rec.eventId}`}
                              aria-label="Copy event ID"
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'inline-flex', color: 'var(--text-secondary)' }}
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v3" />
                              </svg>
                            </button>
                          </span>
                        </td>
                        <td style={{ fontSize: 13 }}>{fmt(rec.amount)}</td>
                        <td style={{ fontSize: 13 }}>{fmt(rec.netAmount)}</td>
                        <td>
                          <StatusBadge status={rec.status} options={PAYOUT_STATUS_OPTIONS} fallback={{ label: rec.status, variant: 'soft' }} />
                        </td>
                        <td style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={transferId !== '—' ? transferId : undefined}>
                          {transferId}
                        </td>
                        <td style={{ fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{rec.createdAt ? formatDateTime(rec.createdAt) : '—'}</td>
                        <td>
                          <div className="table-actions">
                            <button
                              type="button"
                              className="action-link"
                              disabled={retryDisabled}
                              onClick={() => handleRetryRecord(rec)}
                              style={{
                                cursor: retryDisabled ? 'not-allowed' : 'pointer',
                                opacity: retryDisabled ? 0.45 : 1,
                                fontSize: 13,
                                display: 'inline-flex',
                                alignItems: 'center',
                              }}
                            >
                              {isPayingThisEvent && <Spinner />}
                              {isPayingThisEvent ? 'Retrying…' : 'Retry'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                  {records.length === 0 && (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: 32, color: 'var(--text-secondary)' }}>
                        No payout records found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {!recordsLoading && !recordsError && totalPages > 1 && (
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 24, alignItems: 'center' }}>
              <button className="btn btn-ghost btn-sm" disabled={recordsPage === 0} onClick={() => setRecordsPage((p) => p - 1)} style={{ cursor: recordsPage === 0 ? 'not-allowed' : 'pointer' }}>
                Previous
              </button>
              <span style={{ alignSelf: 'center', fontSize: 14, color: 'var(--text-secondary)' }}>
                Page {recordsPage + 1} of {totalPages}
              </span>
              <button
                className="btn btn-ghost btn-sm"
                disabled={recordsPage >= totalPages - 1}
                onClick={() => setRecordsPage((p) => p + 1)}
                style={{ cursor: recordsPage >= totalPages - 1 ? 'not-allowed' : 'pointer' }}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {dialog}
    </div>
  )
}
