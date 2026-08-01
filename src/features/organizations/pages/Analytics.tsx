import { useEffect, useState } from 'react'
import './Analytics.css'
import {
  getEvents,
  getEventSalesTimeline,
  getEventSummary,
  getOverviewKpis,
  getSalesPace,
  type EventComparisonRow,
  type EventComparisonResponse,
  type EventSalesTimelineResponse,
  type EventSummaryResponse,
  type OverviewKpiResponse,
  type SalesPaceResponse,
} from '../services/analyticsApi'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Math.round(value))
}

function formatEGP(value: number): string {
  return `${formatNumber(value)} EGP`
}

function shortDateLabel(iso: string): string {
  const m = Number(iso.slice(5, 7))
  const d = Number(iso.slice(8, 10))
  return `${MONTHS[m - 1]} ${d}`
}

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max)}…` : text
}

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

function fillPct(sold: number, capacity: number): number {
  if (!capacity) return 0
  return Math.min((sold / capacity) * 100, 100)
}

function AnalyticsDrillDown({ event, onBack }: { event: EventComparisonRow; onBack: () => void }) {
  const [summary, setSummary] = useState<EventSummaryResponse | null>(null)
  const [timeline, setTimeline] = useState<EventSalesTimelineResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError('')
      try {
        const [s, t] = await Promise.all([
          getEventSummary(event.eventId),
          getEventSalesTimeline(event.eventId, 'day'),
        ])
        if (!cancelled) {
          setSummary(s)
          setTimeline(t)
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load event analytics')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [event.eventId])

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
  const [refreshKey, setRefreshKey] = useState(0)
  const [kpis, setKpis] = useState<OverviewKpiResponse | null>(null)
  const [salesPace, setSalesPace] = useState<SalesPaceResponse | null>(null)
  const [eventsData, setEventsData] = useState<EventComparisonResponse | null>(null)
  const [selected, setSelected] = useState<EventComparisonRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError('')
      try {
        const [k, p, e] = await Promise.all([
          getOverviewKpis(),
          getSalesPace(),
          getEvents('totalRevenue,desc', 0, 20),
        ])
        if (!cancelled) {
          setKpis(k)
          setSalesPace(p)
          setEventsData(e)
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load analytics')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [refreshKey])

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
          <button className="btn btn-ghost" onClick={() => setRefreshKey((k) => k + 1)}>Retry</button>
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
