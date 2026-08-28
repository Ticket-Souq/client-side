import * as React from 'react'
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../shared/components/ui/card'
import {
  ChartContainer,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '../../../shared/components/ui/chart'
import { formatNumber } from '../../../shared/format'
import { getEventSalesTimeline, getSalesPace } from '../services/analyticsApi'
import { useFetch } from '../../../shared/hooks/useFetch'
import './TicketSalesLineInteractive.css'

export interface TicketPoint {
  date: string // ISO YYYY-MM-DD or YYYY-MM-DDThh:mm...
  tickets: number
}

interface TicketSalesLineInteractiveProps {
  /** If provided, chart fetches per-event timeline; otherwise org-wide sales-pace */
  eventId?: string
  /** Pre-fetched data — when provided, no fetch is done (used by Analytics overview) */
  data?: TicketPoint[] | null
  loading?: boolean
  error?: string | null
}

const chartConfig = {
  tickets: {
    label: 'Tickets Sold',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig

function toTickLabel(value: string): string {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value.slice(5, 10)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function TicketSalesLineInteractive({ eventId, data: propData, loading: propLoading, error: propError }: TicketSalesLineInteractiveProps) {
  const chartId = `ticket-sales-${eventId ?? 'overview'}`
  const shouldFetch = propData === undefined
  const { data: fetched, loading: fetchLoading, error: fetchError } = useFetch(
    async () => {
      if (!shouldFetch) return null
      if (eventId) {
        const res = await getEventSalesTimeline(eventId, 'day')
        return res.series.map((p) => ({ date: p.period, tickets: p.ticketsCumulative ?? 0 }))
      }
      const res = await getSalesPace(eventId)
      return res.series.map((p) => ({ date: p.date, tickets: p.ticketsCumulative ?? 0 }))
    },
    (err) => (err instanceof Error ? err.message : 'Failed to load ticket sales'),
    [eventId, shouldFetch],
  )

  const chartData: TicketPoint[] = React.useMemo(() => {
    if (propData !== undefined) return propData ?? []
    if (fetched) return (fetched as TicketPoint[]).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    return []
  }, [propData, fetched])

  const loading = propLoading ?? (shouldFetch ? fetchLoading : false)
  const error = propError ?? (shouldFetch ? fetchError : null)

  const total = React.useMemo(() => chartData.reduce((acc, cur) => acc + (cur.tickets ?? 0), 0), [chartData])

  const dateRangeLabel = React.useMemo(() => {
    if (chartData.length === 0) return 'No sales yet'
    const first = toTickLabel(chartData[0].date)
    const last = toTickLabel(chartData[chartData.length - 1].date)
    return chartData.length === 1 ? first : `${first} – ${last}`
  }, [chartData])

  if (loading) {
    return (
      <Card data-chart={chartId} className="flex flex-col chart-card">
        <ChartStyle id={chartId} config={chartConfig} />
        <CardHeader className="flex flex-col items-stretch border-b p-0 sm:flex-row">
          <div className="flex flex-1 flex-col justify-center gap-1 px-7 pb-3 sm:pb-0" style={{ paddingTop: 28, paddingBottom: 12 }}>
            <CardTitle>Ticket Sales</CardTitle>
            <CardDescription>Tickets sold per day{eventId ? ' — this event' : ' — all events'}</CardDescription>
          </div>
          <div className="flex">
            <div className="flex flex-1 flex-col justify-center gap-1 border-t px-7 py-7 sm:border-t-0 sm:border-l sm:px-7 sm:py-7">
              <span className="text-xs text-muted-foreground">Tickets</span>
              <span className="text-lg leading-none font-bold sm:text-3xl">—</span>
            </div>
          </div>
        </CardHeader>
        <CardContent style={{ padding: '18px 28px 28px' }}>
          <div className="analytics-loading">Loading ticket sales…</div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card data-chart={chartId} className="flex flex-col chart-card">
        <ChartStyle id={chartId} config={chartConfig} />
        <CardHeader className="flex flex-col items-stretch border-b p-0 sm:flex-row">
          <div className="flex flex-1 flex-col justify-center gap-1 px-7 pb-3 sm:pb-0" style={{ paddingTop: 28, paddingBottom: 12 }}>
            <CardTitle>Ticket Sales</CardTitle>
            <CardDescription>{dateRangeLabel}</CardDescription>
          </div>
        </CardHeader>
        <CardContent style={{ padding: '18px 28px 28px' }}>
          <div className="analytics-error" style={{ padding: 16 }}>{error}</div>
        </CardContent>
      </Card>
    )
  }

  if (chartData.length === 0) {
    return (
      <Card data-chart={chartId} className="flex flex-col chart-card">
        <ChartStyle id={chartId} config={chartConfig} />
        <CardHeader className="flex flex-col items-stretch border-b p-0 sm:flex-row">
          <div className="flex flex-1 flex-col justify-center gap-1 px-7 pb-3 sm:pb-0" style={{ paddingTop: 28, paddingBottom: 12 }}>
            <CardTitle>Ticket Sales</CardTitle>
            <CardDescription>Tickets sold per day</CardDescription>
          </div>
          <div className="flex">
            <div className="flex flex-1 flex-col justify-center gap-1 border-t px-7 py-7 sm:border-t-0 sm:border-l sm:px-7 sm:py-7">
              <span className="text-xs text-muted-foreground">Tickets</span>
              <span className="text-lg leading-none font-bold sm:text-3xl">0</span>
            </div>
          </div>
        </CardHeader>
        <CardContent style={{ padding: '18px 28px 28px' }}>
          <div className="analytics-empty" style={{ padding: 24 }}>No ticket sales yet. Data appears here after reservations are completed.</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card data-chart={chartId} className="flex flex-col chart-card">
      <ChartStyle id={chartId} config={chartConfig} />
      <CardHeader className="flex flex-col items-stretch border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-7 pb-3 sm:pb-0" style={{ paddingTop: 28, paddingBottom: 12 }}>
          <CardTitle>Ticket Sales</CardTitle>
          <CardDescription>{eventId ? `This event — ${dateRangeLabel}` : `All events — ${dateRangeLabel}`}</CardDescription>
        </div>
        <div className="flex">
          <div className="flex flex-1 flex-col justify-center gap-1 border-t px-7 py-7 text-left sm:border-t-0 sm:border-l sm:px-7 sm:py-7">
            <span className="text-xs text-muted-foreground">Tickets</span>
            <span className="text-lg leading-none font-bold sm:text-3xl">{formatNumber(total)}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent style={{ padding: '18px 28px 28px' }}>
        <ChartContainer id={chartId} config={chartConfig} className="aspect-auto h-[250px] w-full">
          <LineChart accessibilityLayer data={chartData} margin={{ left: 12, right: 12, top: 8, bottom: 8 }}>
            <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
              tickFormatter={(value: string) => toTickLabel(value)}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
              tickFormatter={(v: number) => (v >= 1000 ? `${(v / 1000).toFixed(1).replace(/\.0$/, '')}k` : `${v}`)}
              width={36}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[170px]"
                  labelFormatter={(value) => {
                    const d = new Date(String(value))
                    return Number.isNaN(d.getTime())
                      ? String(value)
                      : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                  }}
                  formatter={(value) => `${formatNumber(Number(value))} tickets`}
                />
              }
            />
            <Line
              dataKey="tickets"
              type="monotone"
              stroke="var(--color-tickets)"
              strokeWidth={2.5}
              dot={{ r: 4, fill: 'var(--color-tickets)', stroke: 'var(--white)', strokeWidth: 2 }}
              activeDot={{ r: 6, strokeWidth: 2 }}
              connectNulls
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
