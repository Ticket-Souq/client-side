import React, { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { request } from '../../../shared/http'
import { API } from '../../../shared/api'
import { useFetch } from '../../../shared/hooks/useFetch'
import { PageHeader } from '../../../shared/components/layout/PageHeader/PageHeader'
import { StatChips } from '../../../shared/components/display/StatChips/StatChips'
import { StatusBadge, type StatusBadgeOption } from '../../../shared/components/display/StatusBadge/StatusBadge'
import { LoadingState, ErrorState } from '../../../shared/components/display/StateViews/StateViews'
import { hasUserRole } from '../../../shared/auth'
import { formatDateTime, formatEGP, formatNumber } from '../../../shared/format'
import { toast } from '../../../shared/components/display/Toast/Toast'
import { OrgPayoutBar } from '../components/OrgPayoutBar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../shared/components/ui/card'
import { ChartContainer, ChartStyle } from '../../../shared/components/ui/chart'
import { Pie, PieChart, Cell } from 'recharts'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/components/ui/select'

type PayoutStatus = 'COMPLETED' | 'PENDING' | 'FAILED'

interface PayoutInfo {
  id: string
  status: PayoutStatus
  providerTransferId: string | null
  transferId?: string | null
  createdAt: string
}

interface EventPayoutRow {
  eventId: string
  owed: number
  paid: number
  payout: PayoutInfo | null
}

interface OrgSummary {
  organization: string
  owed: number
  paid: number
  outstanding: number
  eventCount: number
  payoutCount: number
  events: EventPayoutRow[]
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
  const tid =
    (payout as PayoutInfo).providerTransferId ??
    (payout as PayoutInfo).transferId ??
    (payout as PayoutRecord).providerTransferId ??
    (payout as PayoutRecord).transferId
  return tid ? String(tid) : '—'
}

export default function Finances() {
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [recordsPage, setRecordsPage] = useState(0)

  const {
    data: summary,
    loading: summaryLoading,
    error: summaryError,
    refresh: refreshSummary,
  } = useFetch<OrgSummary>(
    () => request<OrgSummary>(API.payout.myOrgSummary),
    'Failed to load finances',
    [],
  )

  const organization = summary?.organization ?? null

  // Reset page when filter or org changes
  React.useEffect(() => {
    setRecordsPage(0)
  }, [statusFilter, organization])

  const {
    data: recordsData,
    loading: recordsLoading,
    error: recordsError,
  } = useFetch<SpringPage<PayoutRecord>>(
    () => {
      if (!organization) return Promise.resolve({ content: [], totalElements: 0, totalPages: 0, number: 0, size: 20 } as SpringPage<PayoutRecord>)
      const query: Record<string, string | number | undefined> = {
        page: recordsPage,
        size: 20,
        organization,
      }
      if (statusFilter !== 'ALL') query.status = statusFilter
      return request<SpringPage<PayoutRecord>>(API.payout.records, { query })
    },
    'Failed to load payout records',
    [organization, recordsPage, statusFilter],
  )

  const copyId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id)
      toast('Copied', 'success')
    } catch {
      toast('Copy failed', 'error')
    }
  }

  const owed = summary?.owed ?? 0
  const paid = summary?.paid ?? 0
  const outstanding = summary?.outstanding ?? 0
  const events = summary?.events ?? []

  const totalPieData = React.useMemo(() => {
    const o = Number(owed) || 0
    const p = Number(paid) || 0
    const out = Number(outstanding) || 0
    if (o <= 0 && p <= 0) return []
    return [
      { name: 'Paid', value: p, fill: 'var(--chart-2)' },
      { name: 'Outstanding', value: out, fill: 'var(--chart-1)' },
    ].filter((d) => d.value > 0)
  }, [owed, paid, outstanding])

  const pieId = 'finances-total-pie'
  const pieConfig = {
    paid: { label: 'Paid', color: 'var(--chart-2)' },
    outstanding: { label: 'Outstanding', color: 'var(--chart-1)' },
  }

  const records = recordsData?.content ?? []
  const totalPages = recordsData?.totalPages ?? 0
  const totalElements = recordsData?.totalElements ?? 0

  if (!hasUserRole('ORG_HEAD')) {
    return <Navigate to="/403" replace />
  }

  return (
    <div className="wrap" style={{ paddingBottom: 48 }}>
      <PageHeader
        title="Finances"
        subtitle={organization ? `Payouts for ${organization} — amounts in EGP. Per-event paid and totals, plus payment records.` : 'Your organization payouts — amounts in EGP.'}
        actions={
          <StatChips
            items={[
              { label: 'Total Owed', value: `${fmt(owed)} EGP` },
              { label: 'Total Paid', value: `${fmt(paid)} EGP`, tone: 'pending' },
              { label: 'Outstanding', value: `${fmt(outstanding)} EGP`, tone: 'flagged' },
            ]}
            style={{ margin: 0 }}
          />
        }
      />

      {summaryLoading && <LoadingState />}
      {summaryError && (
        <>
          <ErrorState message={summaryError} />
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => refreshSummary()} style={{ cursor: 'pointer' }}>
              Retry
            </button>
          </div>
        </>
      )}

      {!summaryLoading && !summaryError && summary && (
        <>
          {/* KPI extra row */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
            <div className="card-white" style={{ padding: '14px 18px', display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                Events: <strong style={{ color: 'var(--ink)', fontFamily: "'IBM Plex Mono', monospace" }}>{formatNumber(summary.eventCount)}</strong>
              </span>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                Payouts: <strong style={{ color: 'var(--ink)', fontFamily: "'IBM Plex Mono', monospace" }}>{formatNumber(summary.payoutCount)}</strong>
              </span>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                Organization: <strong style={{ color: 'var(--ink)' }}>{summary.organization}</strong>
              </span>
            </div>
          </div>

          <div className="chart-grid" style={{ paddingTop: 0, paddingBottom: 28 }}>
            <OrgPayoutBar events={events} />

            <Card data-chart={pieId} className="flex flex-col chart-card">
              <ChartStyle id={pieId} config={pieConfig} />
              <CardHeader className="flex-row items-start space-y-0 pb-0">
                <div className="grid gap-1">
                  <CardTitle>Total Split</CardTitle>
                  <CardDescription>Paid vs outstanding — EGP</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 justify-center pb-0">
                {totalPieData.length === 0 ? (
                  <div className="analytics-empty" style={{ padding: 24 }}>No totals yet</div>
                ) : (
                  <ChartContainer id={pieId} config={pieConfig} className="mx-auto aspect-square w-full max-w-[280px]">
                    <PieChart>
                      <Pie
                        data={totalPieData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={62}
                        outerRadius={92}
                        strokeWidth={3}
                        stroke="var(--white)"
                        paddingAngle={2}
                      >
                        {totalPieData.map((entry, idx) => (
                          <Cell key={`cell-${idx}`} fill={entry.fill} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ChartContainer>
                )}
              </CardContent>
              {totalPieData.length > 0 && (
                <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 8, flexWrap: 'wrap' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
                    <span style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--chart-2)', display: 'inline-block' }} /> Paid {formatEGP(Number(paid))}
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
                    <span style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--chart-1)', display: 'inline-block' }} /> Outstanding {formatEGP(Number(outstanding))}
                  </span>
                </div>
              )}
              <div style={{ textAlign: 'center', marginTop: 12, fontSize: 12, color: 'var(--text-secondary)', fontFamily: "'IBM Plex Mono', monospace" }}>
                Total owed: {formatEGP(Number(owed))} EGP
              </div>
            </Card>

            <div className="chart-card chart-card--wide">
              <h3 className="chart-title">Per-Event Breakdown</h3>
              {events.length === 0 ? (
                <div className="analytics-empty">No events with payouts yet</div>
              ) : (
                <div className="table-wrap" style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                  <table className="table" style={{ tableLayout: 'fixed', width: '100%', margin: 0 }}>
                    <colgroup>
                      <col style={{ width: 190 }} />
                      <col style={{ width: 120 }} />
                      <col style={{ width: 120 }} />
                      <col style={{ width: 130 }} />
                      <col />
                    </colgroup>
                    <thead>
                      <tr>
                        <th style={{ fontSize: 11 }}>Event ID</th>
                        <th style={{ fontSize: 11 }}>Owed (EGP)</th>
                        <th style={{ fontSize: 11 }}>Paid (EGP)</th>
                        <th style={{ fontSize: 11 }}>Status</th>
                        <th style={{ fontSize: 11 }}>Transfer ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {events.map((ev) => {
                        const status = ev.payout?.status ?? 'PENDING'
                        const tid = getTransferId(ev.payout as PayoutInfo)
                        return (
                          <tr key={ev.eventId}>
                            <td style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13 }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }} title={ev.eventId}>
                                <span>{truncateId(ev.eventId)}</span>
                                <button
                                  type="button"
                                  onClick={() => copyId(ev.eventId)}
                                  title={`Copy: ${ev.eventId}`}
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
                            <td style={{ fontSize: 13 }}>{fmt(ev.owed)} EGP</td>
                            <td style={{ fontSize: 13, fontWeight: 600 }}>{fmt(ev.paid)} EGP</td>
                            <td>
                              <StatusBadge status={status} options={PAYOUT_STATUS_OPTIONS} fallback={{ label: status, variant: 'soft' }} />
                            </td>
                            <td style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={tid !== '—' ? tid : undefined}>
                              {tid}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Records section */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
            <h3 className="chart-title" style={{ margin: 0 }}>Payment Records {totalElements > 0 ? `(${formatNumber(totalElements)})` : ''}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Status:</span>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9 w-[160px] rounded-lg pl-2.5" aria-label="Filter by status">
                  <SelectValue placeholder="All">
                    {statusFilter === 'ALL' ? 'All' : statusFilter.charAt(0) + statusFilter.slice(1).toLowerCase()}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent align="end" className="rounded-xl">
                  <SelectItem value="ALL" className="rounded-lg">All</SelectItem>
                  <SelectItem value="COMPLETED" className="rounded-lg">Completed</SelectItem>
                  <SelectItem value="PENDING" className="rounded-lg">Pending</SelectItem>
                  <SelectItem value="FAILED" className="rounded-lg">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {recordsLoading && <LoadingState />}
          {recordsError && <ErrorState message={recordsError} />}

          {!recordsLoading && !recordsError && (
            <div className="card-white table-wrap">
              <table className="table" style={{ tableLayout: 'fixed', width: '100%' }}>
                <colgroup>
                  <col style={{ width: 190 }} />
                  <col style={{ width: 120 }} />
                  <col style={{ width: 120 }} />
                  <col style={{ width: 130 }} />
                  <col style={{ width: 170 }} />
                  <col style={{ width: 170 }} />
                </colgroup>
                <thead>
                  <tr>
                    <th>Event ID</th>
                    <th>Amount (EGP)</th>
                    <th>Net Amount (EGP)</th>
                    <th>Status</th>
                    <th>Transfer ID</th>
                    <th>Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((rec) => {
                    const tid = getTransferId(rec)
                    return (
                      <tr key={`${rec.id ?? rec.eventId}-${rec.createdAt}`}>
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
                        <td style={{ fontSize: 13 }}>{fmt(rec.amount)} EGP</td>
                        <td style={{ fontSize: 13, fontWeight: 600 }}>{fmt(rec.netAmount)} EGP</td>
                        <td>
                          <StatusBadge status={rec.status} options={PAYOUT_STATUS_OPTIONS} fallback={{ label: rec.status, variant: 'soft' }} />
                        </td>
                        <td style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={tid !== '—' ? tid : undefined}>
                          {tid}
                        </td>
                        <td style={{ fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{rec.createdAt ? formatDateTime(rec.createdAt) : '—'}</td>
                      </tr>
                    )
                  })}
                  {records.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: 32, color: 'var(--text-secondary)' }}>
                        No payout records found{statusFilter !== 'ALL' ? ` for ${statusFilter.toLowerCase()}` : ''}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {!recordsLoading && !recordsError && totalPages > 1 && (
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 24, alignItems: 'center' }}>
              <button className="btn btn-ghost btn-sm" disabled={recordsPage === 0} onClick={() => setRecordsPage((p) => Math.max(0, p - 1))} style={{ cursor: recordsPage === 0 ? 'not-allowed' : 'pointer' }}>
                Previous
              </button>
              <span style={{ alignSelf: 'center', fontSize: 14, color: 'var(--text-secondary)' }}>
                Page {recordsPage + 1} of {totalPages}
              </span>
              <button className="btn btn-ghost btn-sm" disabled={recordsPage >= totalPages - 1} onClick={() => setRecordsPage((p) => p + 1)} style={{ cursor: recordsPage >= totalPages - 1 ? 'not-allowed' : 'pointer' }}>
                Next
              </button>
            </div>
          )}
        </>
      )}

      {!summaryLoading && !summaryError && !summary && (
        <div className="analytics-empty" style={{ padding: 32 }}>No finances data yet. Once tickets are sold, payouts will appear here.</div>
      )}
    </div>
  )
}
