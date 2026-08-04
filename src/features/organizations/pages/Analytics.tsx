import { useState } from 'react'
import './Analytics.css'
import {
  getEvents,
  getEventSalesTimeline,
  getEventSummary,
  getOverviewKpis,
  getSalesPace,
  type EventComparisonRow,
} from '../services/analyticsApi'
import { formatEGP, formatNumber, fillPct, shortDateLabel, truncate } from '../../../shared/format'
import { useFetch } from '../../../shared/hooks/useFetch'

interface BarDatum {
  value: number
  label: string
}

const CHART_COLORS = ['#FFC629', '#FF6B6B', '#4ECDC4', '#6C5CE7', '#FF9F1C', '#2EC4B6', '#E76F51', '#A78BFA']

function fillRateColor(pct: number): string {
  if (pct < 40) return '#FF6B6B'
  if (pct < 75) return '#FFC629'
  return '#34D399'
}

function Bars({ data }: { data: BarDatum[] }) {
  if (data.length === 0) return <div className="analytics-empty">No data available</div>
  const max = Math.max(...data.map((d) => d.value), 1)
  const labelStep = Math.max(1, Math.ceil(data.length / 10))
  const ticks = Array.from({ length: 5 }, (_, i) => (i / 4) * max)
  return (
    <div className="chart-area">
      <div className="chart-axes">
        {ticks.map((t) => (
          <div key={t} className="axis-line" style={{ bottom: `${(t / max) * 100}%` }}>
            <span className="axis-label">{formatAxisValue(t)}</span>
          </div>
        ))}
      </div>
      {data.map((d, i) => (
        <div
          key={i}
          className="bar"
          style={{
            height: `${Math.max((d.value / max) * 100, 2)}%`,
            backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
          }}
          title={`${d.label}: ${formatNumber(d.value)}`}
        >
          {i % labelStep === 0 && <span className="bar-label">{d.label}</span>}
        </div>
      ))}
    </div>
  )
}

function formatAxisValue(v: number): string {
  return v >= 1000 ? `${(v / 1000).toFixed(1).replace(/\.0$/, '')}k` : `${Math.round(v)}`
}

const PIE_COLORS = ['#FFC629', '#FF6B6B', '#4ECDC4', '#6C5CE7', '#9AA3AB']

function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
  const polar = (deg: number) => {
    const rad = ((deg - 90) * Math.PI) / 180
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
  }
  const start = polar(endDeg)
  const end = polar(startDeg)
  const largeArc = endDeg - startDeg > 180 ? 1 : 0
  return `M ${start.x.toFixed(3)} ${start.y.toFixed(3)} A ${r} ${r} 0 ${largeArc} 0 ${end.x.toFixed(3)} ${end.y.toFixed(3)}`
}

function PieChart({ data }: { data: { label: string; value: number }[] }) {
  if (data.length === 0 || data.every((d) => d.value <= 0)) {
    return <div className="analytics-empty">No sales data yet</div>
  }
  const total = data.reduce((s, d) => s + d.value, 0)
  const CX = 110
  const CY = 110
  const R = 78
  const STROKE = 30
  let acc = 0
  return (
    <div className="pie-wrap">
      <div className="donut-box">
        <svg width={220} height={220} viewBox="0 0 220 220" className="donut-svg">
          {data.map((d, i) => {
            const start = (acc / total) * 360
            acc += d.value
            const end = (acc / total) * 360
            const isFull = d.value / total >= 0.999
            return isFull ? (
              <circle key={i} cx={CX} cy={CY} r={R} fill="none" stroke={PIE_COLORS[i % PIE_COLORS.length]} strokeWidth={STROKE} />
            ) : (
              <path key={i} d={arcPath(CX, CY, R, start, end)} fill="none" stroke={PIE_COLORS[i % PIE_COLORS.length]} strokeWidth={STROKE} />
            )
          })}
        </svg>
        <div className="donut-center">
          <p className="donut-center-value">{formatNumber(total)}</p>
          <p className="donut-center-label">sold</p>
        </div>
      </div>
      <div className="pie-legend">
        {data.map((d, i) => (
          <div className="pie-legend-item" key={i}>
            <span className="pie-dot" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
            <span className="pie-legend-label">{d.label}</span>
            <span className="pie-legend-value">{formatNumber(d.value)}</span>
            <span className="pie-legend-pct">{formatNumber((d.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function AnalyticsDrillDown({ event, onBack }: { event: EventComparisonRow; onBack: () => void }) {
  const { data, loading, error } = useFetch(
    async () => {
      const [s, t] = await Promise.all([
        getEventSummary(event.eventId),
        getEventSalesTimeline(event.eventId, 'day'),
      ])
      return { summary: s, timeline: t }
    },
    (err) => (err instanceof Error ? err.message : 'Failed to load event analytics'),
    [event.eventId],
  )
  const summary = data?.summary ?? null
  const timeline = data?.timeline ?? null

  return (
    <div className="drilldown">
      <div className="drilldown-header">
        <button className="btn btn-ghost" onClick={onBack}>← Back to overview</button>
        <h3 className="chart-title drilldown-title">{summary ? summary.name : event.name}</h3>
      </div>

      {loading && <div className="analytics-loading">Loading event analytics…</div>}
      {error && <div className="analytics-error">{error}</div>}
      {!loading && !error && summary && (
        <>
          <div className="drilldown-kpis">
            <div className="drilldown-kpi">
              <p className="drilldown-kpi-label">Revenue</p>
              <p className="drilldown-kpi-value">{formatEGP(summary.kpis.revenue.value)}</p>
            </div>
            <div className="drilldown-kpi">
              <p className="drilldown-kpi-label">Tickets sold</p>
              <p className="drilldown-kpi-value">{formatNumber(summary.kpis.sold.value)} <span className="drilldown-kpi-sub">/ {formatNumber(summary.capacity)}</span></p>
            </div>
          </div>

          <div className="chart-card">
            <h3 className="chart-title">Fill Rate</h3>
            <div className="hbar hbar-lg">
              <p className="hbar-label">
                <span>Tickets sold</span>
                <span>{formatNumber(summary.kpis.sold.value)} / {formatNumber(summary.capacity)}</span>
              </p>
              <div className="hbar-track hbar-track--lg">
                <div className="hbar-fill" style={{ width: `${fillPct(summary.kpis.sold.value, summary.capacity)}%` }}></div>
                <span className="hbar-pct">{formatNumber(fillPct(summary.kpis.sold.value, summary.capacity))}%</span>
              </div>
            </div>
          </div>

          <div className="chart-card">
            <h3 className="chart-title">Sales Timeline</h3>
            <Bars
              data={(timeline?.series ?? []).map((p) => ({ value: p.ticketsCumulative, label: shortDateLabel(p.period) }))}
            />
          </div>
        </>
      )}
      {!loading && !error && !summary && <div className="analytics-empty">No analytics available for this event</div>}
    </div>
  )
}

export default function Analytics() {
  const [selected, setSelected] = useState<EventComparisonRow | null>(null)
  const { data, loading, error, refresh } = useFetch(
    async () => {
      const [k, p, e] = await Promise.all([
        getOverviewKpis(),
        getSalesPace(),
        getEvents('totalRevenue,desc', 0, 20),
      ])
      return { k, p, e }
    },
    (err) => (err instanceof Error ? err.message : 'Failed to load analytics'),
  )
  const kpis = data?.k ?? null
  const salesPace = data?.p ?? null
  const eventsData = data?.e ?? null

  const revenue = kpis?.revenue

  const revenueBars: BarDatum[] = (eventsData?.events ?? []).slice(0, 8).map((ev) => ({
    value: ev.revenue,
    label: truncate(ev.name, 10),
  }))

  const ticketBars: BarDatum[] = (salesPace?.series ?? []).map((p) => ({
    value: p.ticketsCumulative,
    label: shortDateLabel(p.date),
  }))

  const pieData = (() => {
    const events = eventsData?.events ?? []
    const sorted = [...events].sort((a, b) => (b.sold ?? 0) - (a.sold ?? 0))
    const items = sorted.slice(0, 4).map((ev) => ({ label: truncate(ev.name, 14), value: ev.sold ?? 0 }))
    const restCount = sorted.slice(4).reduce((s, ev) => s + (ev.sold ?? 0), 0)
    if (restCount > 0) items.push({ label: 'Other', value: restCount })
    return items
  })()

  return (
    <main className="wrap">
      <section style={{ padding: '40px 0 0' }}>
        <div className="summary-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <p className="hero-rev-label">Total revenue</p>
            <p className="stat-number" style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(40px, 12vw, 64px)', color: 'var(--yellow)', lineHeight: 0.9, margin: '10px 0 0' }}>
              {revenue ? formatEGP(revenue.value) : '—'}
            </p>
          </div>
        </div>
      </section>

      {loading && <div className="analytics-loading">Loading analytics…</div>}
      {error && (
        <div className="analytics-error">
          <p>{error}</p>
          <button className="btn btn-ghost" onClick={() => refresh()}>Retry</button>
        </div>
      )}

      {!loading && !error && selected && (
        <AnalyticsDrillDown event={selected} onBack={() => setSelected(null)} />
      )}

      {!loading && !error && !selected && (
        <div className="chart-grid">
          <div className="chart-card">
            <h3 className="chart-title">Revenue by Event</h3>
            <Bars data={revenueBars} />
          </div>

          <div className="chart-card">
            <h3 className="chart-title">Ticket Sales</h3>
            <Bars data={ticketBars} />
          </div>

          <div className="chart-card chart-card--wide">
            <h3 className="chart-title">Event Performance</h3>
            {(eventsData?.events ?? []).length === 0 ? (
              <div className="analytics-empty">No events data yet</div>
            ) : (
              <div className="event-list">
                {(eventsData?.events ?? []).slice(0, 8).map((ev, i) => {
                  const pct = fillPct(ev.sold, ev.capacity)
                  return (
                    <div key={ev.eventId ?? i} className="hbar event-row" onClick={() => setSelected(ev)} title="View event analytics">
                      <p className="hbar-label">
                        <span>{truncate(ev.name, 22)}</span>
                      </p>
                      <div className="hbar-track">
                        <div className="hbar-fill" style={{ width: `${pct}%`, backgroundColor: fillRateColor(pct) }}></div>
                        <span className="hbar-pct">{formatNumber(pct)}%</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="chart-card chart-card--wide">
            <h3 className="chart-title">Top Selling Events</h3>
            <PieChart data={pieData} />
          </div>
        </div>
      )}


      {!loading && !error && !selected && (eventsData?.events.length ?? 0) === 0 && (
        <p className="analytics-empty">No analytics data yet. Create events and sell tickets to see insights here.</p>
      )}
    </main>
  )
}
