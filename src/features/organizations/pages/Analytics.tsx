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

function Bars({ data, colorClass = 'bar-yellow', highlightLast = false }: { data: BarDatum[]; colorClass?: string; highlightLast?: boolean }) {
  if (data.length === 0) return <div className="analytics-empty">No data available</div>
  const max = Math.max(...data.map((d) => d.value), 1)
  const labelStep = Math.max(1, Math.ceil(data.length / 10))
  return (
    <div className="chart-area">
      {data.map((d, i) => (
        <div
          key={i}
          className={`bar ${i === data.length - 1 && highlightLast ? 'bar-deep' : colorClass}`}
          style={{ height: `${Math.max((d.value / max) * 100, 2)}%` }}
          title={`${d.label}: ${formatNumber(d.value)}`}
        >
          {i % labelStep === 0 && <span className="bar-label">{d.label}</span>}
        </div>
      ))}
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
            <div className="drilldown-kpi">
              <p className="drilldown-kpi-label">Fill rate</p>
              <p className="drilldown-kpi-value">{formatNumber(fillPct(summary.kpis.sold.value, summary.capacity))}%</p>
            </div>
            <div className="drilldown-kpi">
              <p className="drilldown-kpi-label">Check-in rate</p>
              <p className="drilldown-kpi-value">{summary.kpis.checkInRate.valuePct != null ? `${formatNumber(summary.kpis.checkInRate.valuePct)}%` : '—'}</p>
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
  const ticketsSold = kpis?.ticketsSold
  const avgTicketPrice = kpis?.avgTicketPrice

  const revenueBars: BarDatum[] = (eventsData?.events ?? []).slice(0, 8).map((ev) => ({
    value: ev.revenue,
    label: truncate(ev.name, 10),
  }))

  const ticketBars: BarDatum[] = (salesPace?.series ?? []).map((p) => ({
    value: p.ticketsCumulative,
    label: shortDateLabel(p.date),
  }))

  return (
    <main className="wrap">
      <section style={{ padding: '40px 0 0' }}>
        <div className="summary-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <p className="hero-rev-label">Total revenue</p>
            <p className="stat-number" style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 64, color: 'var(--yellow)', lineHeight: 0.9, margin: '10px 0 0' }}>
              {revenue ? formatEGP(revenue.value) : '—'}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button className="btn btn-primary">Export report</button>
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
            <Bars data={ticketBars} highlightLast />
          </div>

          <div className="chart-card">
            <h3 className="chart-title">Event Performance</h3>
            {(eventsData?.events ?? []).length === 0 ? (
              <div className="analytics-empty">No events data yet</div>
            ) : (
              (eventsData?.events ?? []).slice(0, 8).map((ev, i) => (
                <div key={ev.eventId ?? i} className="hbar event-row" onClick={() => setSelected(ev)} title="View event analytics">
                  <p className="hbar-label">
                    <span>{truncate(ev.name, 22)}</span>
                    <span>{formatNumber(fillPct(ev.sold, ev.capacity))}%</span>
                  </p>
                  <div className="hbar-track">
                    <div className="hbar-fill" style={{ width: `${fillPct(ev.sold, ev.capacity)}%`, background: 'var(--yellow)' }}></div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="chart-card">
            <h3 className="chart-title">Key Metrics</h3>
            <div className="stat-list">
              <div className="stat-item"><span>Tickets sold</span><span>{ticketsSold ? formatNumber(ticketsSold.value) : '—'}</span></div>
              <hr className="stat-divider" />
              <div className="stat-item"><span>Total capacity</span><span>{ticketsSold ? formatNumber(ticketsSold.capacity) : '—'}</span></div>
              <hr className="stat-divider" />
              <div className="stat-item"><span>Avg ticket price</span><span>{avgTicketPrice ? formatEGP(avgTicketPrice.value) : '—'}</span></div>
              <hr className="stat-divider" />
              <div className="stat-item"><span>Check-in rate</span><span>{kpis?.checkInRate.valuePct != null ? `${formatNumber(kpis.checkInRate.valuePct)}%` : '—'}</span></div>
              <hr className="stat-divider" />
              <div className="stat-item"><span>No-show rate</span><span>{kpis?.checkInRate.noShowPct != null ? `${formatNumber(kpis.checkInRate.noShowPct)}%` : '—'}</span></div>
              <hr className="stat-divider" />
              <div className="stat-item"><span>Events tracked</span><span>{eventsData ? formatNumber(eventsData.events.length) : '—'}</span></div>
            </div>
          </div>
        </div>
      )}

      {!loading && !error && !selected && (eventsData?.events.length ?? 0) === 0 && (
        <p className="analytics-empty">No analytics data yet. Create events and sell tickets to see insights here.</p>
      )}
    </main>
  )
}
