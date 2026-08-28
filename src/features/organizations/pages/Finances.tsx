import React, { useCallback } from 'react'
import { Navigate } from 'react-router-dom'
import { request } from '../../../shared/http'
import { API } from '../../../shared/api'
import { useFetch } from '../../../shared/hooks/useFetch'
import { PageHeader } from '../../../shared/components/layout/PageHeader/PageHeader'
import { StatChips } from '../../../shared/components/display/StatChips/StatChips'
import { StatusBadge, type StatusBadgeOption } from '../../../shared/components/display/StatusBadge/StatusBadge'
import { LoadingState, ErrorState } from '../../../shared/components/display/StateViews/StateViews'
import { hasUserRole } from '../../../shared/auth'
import { formatEGP, formatNumber } from '../../../shared/format'
import { toast } from '../../../shared/components/display/Toast/Toast'
import { OrgPayoutBar } from '../components/OrgPayoutBar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../shared/components/ui/card'
import { ChartContainer, ChartStyle } from '../../../shared/components/ui/chart'
import { Pie, PieChart, Cell } from 'recharts'

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

function getTransferId(payout: PayoutInfo | null | undefined): string {
  if (!payout) return '—'
  const tid = payout.providerTransferId ?? payout.transferId
  return tid ? String(tid) : '—'
}

export default function Finances() {
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

  const handleExportCsv = useCallback(() => {
    if (!summary || events.length === 0) {
      toast('No data to export', 'info')
      return
    }
    const headers = ['Event ID', 'Owed (EGP)', 'Paid (EGP)', 'Status', 'Transfer ID']
    const esc = (v: string) => `"${String(v).replace(/"/g, '""')}"`
    const rows = events.map((ev) => {
      const status = ev.payout?.status ?? 'PENDING'
      const tid = getTransferId(ev.payout)
      return [ev.eventId, fmt(ev.owed), fmt(ev.paid), status, tid].map(esc).join(',')
    })
    const csv = [headers.map(esc).join(','), ...rows].join('\r\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const safeOrg = summary.organization.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '')
    a.download = `finances-${safeOrg}-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    toast('CSV exported', 'success')
  }, [summary, events])

  if (!hasUserRole('ORG_HEAD')) {
    return <Navigate to="/403" replace />
  }

  return (
    <div className="wrap" style={{ paddingBottom: 48 }}>
      <PageHeader
        title="Finances"
        subtitle={organization ? `Payouts for ${organization} — amounts in EGP. Per-event paid and totals.` : 'Your organization payouts — amounts in EGP.'}
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

          <div className="chart-grid" style={{ paddingTop: 0, paddingBottom: 28, gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 560px))', justifyContent: 'center', maxWidth: 1120, margin: '0 auto' }}>
            <OrgPayoutBar events={events} />

            <Card data-chart={pieId} className="flex flex-col chart-card" style={{ maxWidth: 380, width: '100%', margin: '0 auto' }}>
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

            <div className="chart-card chart-card--wide" style={{ maxWidth: 1120, margin: '0 auto', width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
                <h3 className="chart-title" style={{ margin: 0 }}>Per-Event Breakdown</h3>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  disabled={events.length === 0}
                  onClick={handleExportCsv}
                  style={{ cursor: events.length === 0 ? 'not-allowed' : 'pointer', opacity: events.length === 0 ? 0.5 : 1, display: 'inline-flex', alignItems: 'center', gap: 6, border: '1px solid var(--border)', background: 'var(--white)' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Export CSV
                </button>
              </div>
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
                        const tid = getTransferId(ev.payout)
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
        </>
      )}

      {!summaryLoading && !summaryError && !summary && (
        <div className="analytics-empty" style={{ padding: 32 }}>No finances data yet. Once tickets are sold, payouts will appear here.</div>
      )}
    </div>
  )
}
