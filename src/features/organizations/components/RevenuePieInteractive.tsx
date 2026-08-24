import * as React from 'react'
import { Label, Pie, PieChart, Sector } from 'recharts'
import type { PieSectorDataItem } from 'recharts/types/polar/Pie'

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../shared/components/ui/select'
import { formatEGP, truncate } from '../../../shared/format'
import type { EventComparisonRow } from '../services/analyticsApi'
import './RevenuePieInteractive.css'

export interface RevenuePieDatum {
  eventId: string
  name: string
  revenue: number
  fill: string
}

interface RevenuePieInteractiveProps {
  events: EventComparisonRow[]
  loading?: boolean
  error?: string | null
}

const CHART_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
]

function buildChartData(events: EventComparisonRow[]): RevenuePieDatum[] {
  const top5 = [...events]
    .sort((a, b) => (b.revenue ?? 0) - (a.revenue ?? 0))
    .slice(0, 5)
  return top5.map((ev, i) => ({
    eventId: ev.eventId,
    name: ev.name,
    revenue: ev.revenue ?? 0,
    fill: CHART_COLORS[i % CHART_COLORS.length],
  }))
}

export function RevenuePieInteractive({ events, loading, error }: RevenuePieInteractiveProps) {
  const id = 'revenue-pie-interactive'
  const chartData = React.useMemo(() => buildChartData(events), [events])

  const chartConfig = React.useMemo(() => {
    const cfg: ChartConfig = {
      revenue: { label: 'Revenue' },
    }
    chartData.forEach((d, i) => {
      cfg[d.eventId] = { label: truncate(d.name, 18), color: CHART_COLORS[i % CHART_COLORS.length] }
    })
    return cfg
  }, [chartData])

  const [activeEventId, setActiveEventId] = React.useState<string>(() => chartData[0]?.eventId ?? '')

  // eslint-disable-next-line react-hooks/set-state-in-effect
  React.useEffect(() => {
    if (chartData.length > 0 && !chartData.some((d) => d.eventId === activeEventId)) {
      setActiveEventId(chartData[0].eventId)
    }
  }, [chartData, activeEventId])

  const activeIndex = React.useMemo(
    () => chartData.findIndex((item) => item.eventId === activeEventId),
    [chartData, activeEventId],
  )

  const activeDatum = activeIndex >= 0 ? chartData[activeIndex] : null

  const renderActiveShape = React.useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (props: any) => {
      const p = props as PieSectorDataItem & { outerRadius?: number; index?: number } & Record<string, unknown>
      const idx = (p as { index?: number }).index ?? -1
      const outerRadius = (p.outerRadius as number | undefined) ?? 0
      if (idx === activeIndex) {
        return (
          <g>
            <Sector {...(p as object)} outerRadius={outerRadius + 10} />
            <Sector {...(p as object)} outerRadius={outerRadius + 25} innerRadius={outerRadius + 12} />
          </g>
        )
      }
      return <Sector {...(p as object)} outerRadius={outerRadius} />
    },
    [activeIndex],
  )

  if (loading) {
    return (
      <Card data-chart={id} className="flex flex-col chart-card">
        <CardHeader className="flex-row items-start space-y-0 pb-0">
          <div className="grid gap-1">
            <CardTitle>Revenue by Event</CardTitle>
            <CardDescription>Top 5 events by revenue</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex flex-1 justify-center pb-0">
          <div className="analytics-loading">Loading revenue…</div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card data-chart={id} className="flex flex-col chart-card">
        <CardHeader className="flex-row items-start space-y-0 pb-0">
          <div className="grid gap-1">
            <CardTitle>Revenue by Event</CardTitle>
            <CardDescription>Top 5 events by revenue</CardDescription>
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
            <CardTitle>Revenue by Event</CardTitle>
            <CardDescription>Top 5 events by revenue</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex flex-1 justify-center pb-0">
          <div className="analytics-empty" style={{ padding: 24 }}>No revenue data yet. Sell tickets to see revenue per event.</div>
        </CardContent>
      </Card>
    )
  }

  // recharts expects dataKey that maps to numeric value; we use "revenue" and nameKey "name"
  // For select, map eventId -> display label with color dot
  return (
    <Card data-chart={id} className="flex flex-col chart-card">
      <ChartStyle id={id} config={chartConfig} />
      <CardHeader className="flex-row items-start space-y-0 pb-0">
        <div className="grid gap-1">
          <CardTitle>Revenue by Event</CardTitle>
          <CardDescription>Top 5 events by revenue</CardDescription>
        </div>
        <Select value={activeEventId} onValueChange={setActiveEventId}>
          <SelectTrigger className="ml-auto h-7 w-[160px] rounded-lg pl-2.5" aria-label="Select event">
            <SelectValue placeholder="Select event">
              {activeDatum ? truncate(activeDatum.name, 22) : ''}
            </SelectValue>
          </SelectTrigger>
          <SelectContent align="end" className="rounded-xl">
            {chartData.map((d, i) => (
              <SelectItem key={d.eventId} value={d.eventId} className="rounded-lg [&_span]:flex">
                <div className="flex items-center gap-2 text-xs">
                  <span
                    className="flex h-3 w-3 shrink-0 rounded-xs"
                    style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                  />
                  {truncate(d.name, 22)}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="flex flex-1 justify-center pb-0">
        <ChartContainer id={id} config={chartConfig} className="mx-auto aspect-square w-full max-w-[300px]">
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel formatter={(value) => formatEGP(Number(value))} />} />
            <Pie
              data={chartData}
              dataKey="revenue"
              nameKey="name"
              innerRadius={60}
              strokeWidth={5}
              stroke="var(--white)"
              shape={renderActiveShape as unknown as never}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox && activeDatum) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                          style={{ fill: 'var(--ink)', fontFamily: 'var(--font-mono)', fontSize: '22px', fontWeight: 700 }}
                        >
                          {formatEGP(activeDatum.revenue)}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy as number) + 24}
                          style={{ fill: 'var(--text-secondary)', fontSize: '12px' }}
                        >
                          {truncate(activeDatum.name, 18)}
                        </tspan>
                      </text>
                    )
                  }
                  return null
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
