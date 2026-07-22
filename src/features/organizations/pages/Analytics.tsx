import { Fragment } from 'react'
import './Analytics.css'

const MONTHLY_REVENUE = [180, 220, 190, 260, 310, 280, 340, 370, 390, 350, 380, 410]
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const EVENT_PERFORMANCE = [
  { name: 'Nile Nights Festival', pct: 94 },
  { name: 'Rooftop Jazz', pct: 78 },
  { name: 'Comedy Night', pct: 65 },
  { name: 'Aqua Splash Weekend', pct: 51 },
  { name: 'Family Carnival', pct: 43 },
]

const ORG_STATS = [
  { label: 'Active organizations', value: '48' },
  { label: 'Pending approvals', value: '24' },
  { label: 'Total events listed', value: '312' },
  { label: 'Events this month', value: '67' },
  { label: 'Avg tickets per event', value: '184' },
  { label: 'Top category', value: 'Music' },
]

export default function Analytics() {
  return (
    <main className="wrap">
      <section style={{ padding: '40px 0 0' }}>
        <div className="summary-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p className="hero-rev-label">Revenue this month</p>
            <p className="stat-number" style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 64, color: 'var(--yellow)', lineHeight: 0.9, margin: '10px 0 0' }}>EGP 284,500</p>
            <p className="stat-change">12.3% <span className="up">&#8593;</span> up from last month</p>
          </div>
          <button className="btn btn-primary">Export report</button>
        </div>
      </section>

      <div className="chart-grid">
        <div className="chart-card">
          <h3 className="chart-title">Revenue Overview</h3>
          <div className="chart-area">
            {MONTHLY_REVENUE.map((v, i) => (
              <div key={i} className={`bar ${i === 8 ? 'bar-deep' : 'bar-yellow'}`} style={{ height: `${v / 5}px` }}>
                <span className="bar-label">{MONTHS[i]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Ticket Sales</h3>
          <div className="donut-placeholder"></div>
          <div className="donut-legend">
            <span style={{ '--c': 'var(--yellow)' } as React.CSSProperties}>Standard 58%</span>
            <span style={{ '--c': 'var(--border)' } as React.CSSProperties}>VIP 18%</span>
            <span style={{ '--c': 'var(--ink-soft)' } as React.CSSProperties}>Group 12%</span>
            <span style={{ '--c': 'var(--yellow-deep)' } as React.CSSProperties}>Early Bird 12%</span>
          </div>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Event Performance</h3>
          {EVENT_PERFORMANCE.map((e, i) => (
            <div key={i} className="hbar">
              <p className="hbar-label"><span>{e.name}</span><span>{e.pct}%</span></p>
              <div className="hbar-track">
                <div className="hbar-fill" style={{ width: `${e.pct}%`, background: 'var(--yellow)' }}></div>
              </div>
            </div>
          ))}
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Customer Growth</h3>
          <div className="line-placeholder"></div>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Organization Analytics</h3>
          <div className="stat-list">
            {ORG_STATS.map((s, i) => (
              <Fragment key={i}>
                <div className="stat-item"><span>{s.label}</span><span>{s.value}</span></div>
                {i < ORG_STATS.length - 1 && <hr className="stat-divider" />}
              </Fragment>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Payment Methods</h3>
          <div className="pie-placeholder">
            <div className="pie-vis"></div>
            <div className="pie-legend">
              <span style={{ '--c': 'var(--yellow)' } as React.CSSProperties}>Credit Card 42%</span>
              <span style={{ '--c': 'var(--ink-soft)' } as React.CSSProperties}>Wallet 23%</span>
              <span style={{ '--c': 'var(--border)' } as React.CSSProperties}>Bank Transfer 16%</span>
              <span style={{ '--c': 'var(--yellow-deep)' } as React.CSSProperties}>Cash 19%</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
