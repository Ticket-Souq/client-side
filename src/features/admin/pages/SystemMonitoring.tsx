import { useState, useEffect } from 'react'

const GRAFANA_URL = import.meta.env.VITE_GRAFANA_URL || 'http://localhost:3000'

const TABS = [
  { id: 'dashboards', label: 'Dashboards' },
  { id: 'metrics', label: 'Metrics' },
  { id: 'logs', label: 'Logs' },
  { id: 'traces', label: 'Traces' },
] as const

type TabId = typeof TABS[number]['id']

function exploreUrl(base: string, datasource: string): string {
  return `${base}/explore?orgId=1&left=${encodeURIComponent(JSON.stringify({ datasource }))}`
}

interface GrafanaDashboard {
  uid: string
  title: string
  url: string
}

// Provisioned dashboards, used as a fallback when the Grafana API can't be
// reached from the browser (cross-origin requests are blocked).
const FALLBACK_DASHBOARDS: GrafanaDashboard[] = [
  { uid: 'continuous-profiling', title: 'Continuous Profiling', url: '/d/continuous-profiling/continuous-profiling' },
  { uid: 'prometheus-spring-boot', title: 'Prometheus Spring Boot', url: '/d/prometheus-spring-boot/prometheus-spring-boot' },
  { uid: 'loki-logs', title: 'Loki Logs', url: '/d/loki-logs/loki-logs' },
  { uid: 'network-containers', title: 'Network & Containers', url: '/d/network-containers/network-containers' },
  { uid: 'postgresql-databases', title: 'PostgreSQL Databases', url: '/d/postgresql-databases/postgresql-databases' },
  { uid: 'kafka-overview', title: 'Kafka Overview', url: '/d/kafka-overview/kafka-overview' },
  { uid: 'redis-overview', title: 'Redis Overview', url: '/d/redis-overview/redis-overview' },
]

export default function SystemMonitoring() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboards')
  const [grafanaUrl, setGrafanaUrl] = useState(GRAFANA_URL)
  const [urlInput, setUrlInput] = useState(GRAFANA_URL)
  const [dashboards, setDashboards] = useState<GrafanaDashboard[]>([])
  const [selectedDash, setSelectedDash] = useState<string | null>(null)
  const [loadingDashboards, setLoadingDashboards] = useState(true)

  useEffect(() => {
    let cancelled = false
    const loadDashboards = async () => {
      let list: GrafanaDashboard[] = FALLBACK_DASHBOARDS
      try {
        const res = await fetch(`${grafanaUrl}/api/search?type=dash-db`)
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data) && data.length > 0) {
            list = data
          }
        }
      } catch {
        list = FALLBACK_DASHBOARDS
      }
      if (cancelled) return
      setDashboards(list)
      if (list.length > 0) {
        setSelectedDash((prev) => (prev && list.some((d) => d.uid === prev) ? prev : list[0].uid))
      }
      setLoadingDashboards(false)
    }
    loadDashboards()
    return () => {
      cancelled = true
    }
  }, [grafanaUrl])

  const handleUrlSave = () => {
    const trimmed = urlInput.trim().replace(/\/+$/, '')
    if (trimmed) {
      setLoadingDashboards(true)
      setGrafanaUrl(trimmed)
      setSelectedDash(null)
    }
  }

  const selected = dashboards.find(d => d.uid === selectedDash)
  const dashboardUrl = selected
    ? `${grafanaUrl}${selected.url}?orgId=1&from=now-1h&to=now&kiosk`
    : `${grafanaUrl}?orgId=1&from=now-1h&to=now&kiosk`

  return (
    <div className="wrap oversight-page">
      <div className="page-head">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 className="section-title" style={{ margin: 0 }}>System Monitoring</h1>
            <p className="section-sub" style={{ margin: '4px 0 0' }}>
              Real-time metrics, logs, and traces via Grafana.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              className="form-input"
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onBlur={handleUrlSave}
              onKeyDown={(e) => e.key === 'Enter' && handleUrlSave()}
              placeholder="Grafana URL"
              style={{ height: 36, fontSize: 13, width: 260 }}
            />
            <button
              type="button"
              onClick={() => window.open(grafanaUrl, '_blank')}
              style={{ height: 36, padding: '0 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--white)', fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              Open Grafana ↗
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 20px',
              fontSize: 14,
              fontWeight: 600,
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: activeTab === tab.id ? 'var(--ink)' : 'var(--text-secondary)',
              borderBottom: activeTab === tab.id ? '2px solid var(--yellow)' : '2px solid transparent',
              marginBottom: '-1px',
              transition: 'color 150ms ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'dashboards' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', fontFamily: "'IBM Plex Mono', monospace", letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Dashboard
            </label>
            {loadingDashboards ? (
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Loading dashboards…</span>
            ) : (
              <select
                className="form-select"
                value={selectedDash || ''}
                onChange={(e) => setSelectedDash(e.target.value || null)}
                style={{ height: 40, fontSize: 14, flex: '1 1 240px', minWidth: 0, maxWidth: 480 }}
              >
                {dashboards.length === 0 && <option value="">No dashboards found</option>}
                {dashboards.map(d => (
                  <option key={d.uid} value={d.uid}>{d.title}</option>
                ))}
              </select>
            )}
            {selected && (
              <button
                type="button"
                onClick={() => window.open(`${grafanaUrl}${selected.url}?orgId=1`, '_blank')}
                style={{ height: 40, padding: '0 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--white)', fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                Open in Grafana ↗
              </button>
            )}
          </div>
          <div className="card-white" style={{ padding: 0, overflow: 'hidden' }}>
            <iframe
              src={dashboardUrl}
              width="100%"
              height={2000}
              frameBorder="0"
              style={{ display: 'block' }}
              title="Grafana Dashboard"
            />
          </div>
        </div>
      )}

      {activeTab === 'metrics' && (
        <div className="card-white" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>Metrics (Prometheus)</span>
            <button
              type="button"
              onClick={() => window.open(exploreUrl(grafanaUrl, 'Prometheus'), '_blank')}
              style={{ fontSize: 12, color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              Open in Grafana ↗
            </button>
          </div>
          <iframe
            src={exploreUrl(grafanaUrl, 'Prometheus')}
            width="100%"
            height={2000}
            frameBorder="0"
            style={{ display: 'block' }}
            title="Grafana Metrics"
          />
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="card-white" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>Application Logs (Loki)</span>
            <button
              type="button"
              onClick={() => window.open(exploreUrl(grafanaUrl, 'Loki'), '_blank')}
              style={{ fontSize: 12, color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              Open in Grafana ↗
            </button>
          </div>
          <iframe
            src={exploreUrl(grafanaUrl, 'Loki')}
            width="100%"
            height={2000}
            frameBorder="0"
            style={{ display: 'block' }}
            title="Grafana Logs"
          />
        </div>
      )}

      {activeTab === 'traces' && (
        <div className="card-white" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>Distributed Traces (Tempo)</span>
            <button
              type="button"
              onClick={() => window.open(exploreUrl(grafanaUrl, 'Tempo'), '_blank')}
              style={{ fontSize: 12, color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              Open in Grafana ↗
            </button>
          </div>
          <iframe
            src={exploreUrl(grafanaUrl, 'Tempo')}
            width="100%"
            height={2000}
            frameBorder="0"
            style={{ display: 'block' }}
            title="Grafana Traces"
          />
        </div>
      )}
    </div>
  )
}
