import * as React from 'react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../shared/components/ui/card'
import { ChartContainer, ChartStyle, ChartTooltip, ChartTooltipContent, type ChartConfig } from '../../../shared/components/ui/chart'
import { formatEGP, truncate } from '../../../shared/format'

interface EventPayoutRow {
  eventId: string
  owed: number
  paid: number
  payout: unknown
}

interface OrgPayoutBarProps {
  events: EventPayoutRow[]
  loading?: boolean
  error?: string | null
}

const chartConfig = {
  paid: { label: 'Paid', color: 'var(--chart-2)' },
  outstanding: { label: 'Outstanding', color: 'var(--chart-1)' },
  owed: { label: 'Owed', color: 'var(--chart-3)' },
} satisfies ChartConfig

function truncateId(id: string): string {
  return id.length > 8 ? `${id.slice(0, 8)}…` : id
}

export function OrgPayoutBar({ events, loading, error }: OrgPayoutBarProps) {
  const id = 'org-payout-bar'
  const chartData = React.useMemo(() => {
    return events.map((e) => {
      const owed = Number(e.owed) || 0
      const paid = Number(e.paid) || 0
      const outstanding = Math.max(owed - paid, 0)
      return {
        eventId: e.eventId,
        shortId: truncate(truncateId(e.eventId), 9),
        owed,
        paid,
        outstanding,
      }
    })
  }, [events])

  if (loading) {
    return (
      <Card data-chart={id} className="flex flex-col chart-card">
        <CardHeader className="flex-row items-start space-y-0 pb-0">
          <div className="grid gap-1">
            <CardTitle>Per-Event Payout</CardTitle>
            <CardDescription>Paid vs outstanding per event (EGP)</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex flex-1 justify-center pb-0">
          <div className="analytics-loading">Loading payouts…</div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card data-chart={id} className="flex flex-col chart-card">
        <CardHeader className="flex-row items-start space-y-0 pb-0">
          <div className="grid gap-1">
            <CardTitle>Per-Event Payout</CardTitle>
            <CardDescription>Paid vs outstanding per event (EGP)</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex flex-1 justify-center pb-0">
          <div className="analytics-error" style={{ padding: 16 }}>{error}</div>
        </CardContent>
      </Card>
    )
  }

  if (chartData.length === 0) {
    return (
      <Card data-chart={id} className="flex flex-col chart-card">
        <ChartStyle id={id} config={chartConfig} />
        <CardHeader className="flex-row items-start space-y-0 pb-0">
          <div className="grid gap-1">
            <CardTitle>Per-Event Payout</CardTitle>
            <CardDescription>Paid vs outstanding per event (EGP)</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex flex-1 justify-center pb-0">
          <div className="analytics-empty" style={{ padding: 24 }}>No payout data yet. Events will appear after tickets are sold and payouts are processed.</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card data-chart={id} className="flex flex-col chart-card">
      <ChartStyle id={id} config={chartConfig} />
      <CardHeader className="flex-row items-start space-y-0 pb-0">
        <div className="grid gap-1">
          <CardTitle>Per-Event Payout</CardTitle>
          <CardDescription>Paid vs outstanding per event — EGP</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer id={id} config={chartConfig} className="mx-auto aspect-auto h-[220px] w-full max-w-[520px]">
          <BarChart accessibilityLayer data={chartData} margin={{ left: 12, right: 12, top: 8, bottom: 28 }} barCategoryGap="28%" barSize={26}>
            <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis
              dataKey="shortId"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
              angle={-28}
              textAnchor="end"
              interval={0}
              height={48}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
              tickFormatter={(v: number) => (v >= 1000 ? `${(v / 1000).toFixed(1).replace(/\.0$/, '')}k` : `${v}`)}
              width={44}
            />
            <ChartTooltip
              cursor={{ fill: 'var(--border)', opacity: 0.22 }}
              content={
                <ChartTooltipContent
                  className="w-[200px]"
                  labelFormatter={(_label, payload) => {
                    const first = payload?.[0] as unknown as { payload?: { eventId?: string } } | undefined
                    const eid = first?.payload?.eventId
                    return eid ? `Event ${truncateId(String(eid))}` : String(_label)
                  }}
                  formatter={(value, name) => (
                    <span style={{ display: 'flex', justifyContent: 'space-between', width: '100%', gap: 12 }}>
                      <span style={{ textTransform: 'capitalize' }}>{String(name)}</span>
                      <span style={{ fontWeight: 600 }}>{formatEGP(Number(value))}</span>
                    </span>
                  )}
                />
              }
            />
            <Bar dataKey="paid" stackId="a" fill="var(--color-paid)" radius={[0, 0, 4, 4]} maxBarSize={44} />
            <Bar dataKey="outstanding" stackId="a" fill="var(--color-outstanding)" radius={[4, 4, 0, 0]} maxBarSize={44} />
          </BarChart>
        </ChartContainer>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 12, fontSize: 12, color: 'var(--text-secondary)' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--chart-2)', display: 'inline-block' }} /> Paid
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--chart-1)', display: 'inline-block' }} /> Outstanding
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
