import { useState, useCallback } from 'react'
import './QRValidation.css'

const MOCK_TICKETS: Record<string, { event: string; type: string; row: string; seat: string; status: string }> = {
  'TICKET-2026-0719-0042': { event: 'Nile Nights Festival', type: 'VIP', row: 'A', seat: '12', status: 'valid' },
  'TICKET-2026-0720-0013': { event: 'Rooftop Jazz', type: 'Regular', row: 'D', seat: '45', status: 'used' },
  'TICKET-2026-0725-0089': { event: 'Comedy Night', type: 'Regular', row: 'B', seat: '22', status: 'valid' },
}

const RECENT_SCANS: { id: string; event: string; type: string; status: string; time: string }[] = []

interface ScanResult {
  id: string
  event: string
  type: string
  row: string
  seat: string
  status: string
  timestamp: string
}

export default function QRValidation() {
  const [event, setEvent] = useState('Nile Nights Festival')
  const [scanning, setScanning] = useState(false)
  const [manualId, setManualId] = useState('')
  const [result, setResult] = useState<ScanResult | null>(null)
  const [scans, setScans] = useState(RECENT_SCANS)

  const showResult = useCallback((ticket: typeof MOCK_TICKETS[string], id: string) => {
    setResult({
      id,
      ...ticket,
      timestamp: new Date().toLocaleTimeString(),
    })
    setScans((prev) => [{ id, event: ticket.event, type: ticket.type, status: ticket.status, time: 'Just now' }, ...prev])
  }, [])

  const validateTicket = useCallback((id: string) => {
    const ticket = MOCK_TICKETS[id]
    if (!ticket) {
      setResult({ id, event: '—', type: '—', row: '—', seat: '—', status: 'invalid', timestamp: new Date().toLocaleTimeString() })
      return
    }
    if (ticket.status === 'used') {
      setResult({ id, ...ticket, timestamp: new Date().toLocaleTimeString() })
      return
    }
    showResult(ticket, id)
  }, [showResult])

  const startScanning = useCallback(() => {
    setScanning(true)
    setTimeout(() => {
      setScanning(false)
      validateTicket('TICKET-2026-0719-0042')
    }, 4000)
  }, [validateTicket])

  const stopScanning = useCallback(() => {
    setScanning(false)
  }, [])

  return (
    <main className="wrap">
      <div className="page-title-row">
        <h1 className="section-title" style={{ margin: 0 }}>QR Scanner</h1>
        <a href="/org/events" className="btn btn-ghost">Back to Events</a>
      </div>

      <div className="card-white">
        <div className="section-row">
          <h2 className="card-title" style={{ margin: 0 }}>Select Event</h2>
        </div>
        <select className="form-select" value={event} onChange={(e) => setEvent(e.target.value)} style={{ maxWidth: 400 }}>
          <option>Nile Nights Festival</option>
          <option>Rooftop Jazz</option>
          <option>Comedy Night</option>
          <option>Art Expo</option>
        </select>
      </div>

      <div className="card-white">
        <div className="scanner-wrap">
          <p className="scanner-label">Scan Ticket</p>
          <div className={`scanner-viewport ${scanning ? 'scanning' : ''}`}>
            <video id="scannerVideo" autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', background: 'var(--ink)' }} />
            <div className="scanner-overlay">
              <div className="scanner-frame">
                <div className="scanner-corner tl"></div>
                <div className="scanner-corner tr"></div>
                <div className="scanner-corner bl"></div>
                <div className="scanner-corner br"></div>
              </div>
              <div className="scan-line"></div>
            </div>
            {scanning && <div className="scanner-status">Scanning...</div>}
            {!scanning && (
              <div className="no-camera" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="no-camera-icon" style={{ width: 64, height: 64, borderRadius: '50%', background: '#f0efe8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>&#128247;</div>
                <p className="no-camera-text">Camera not available. Use manual entry below.</p>
              </div>
            )}
          </div>
          <p className="scanner-hint">Position the QR code within the frame</p>
          <div className="scanner-actions">
            {!scanning ? (
              <button className="btn btn-primary" onClick={startScanning}>Start Scanning</button>
            ) : (
              <button className="btn btn-ghost" onClick={stopScanning}>Stop</button>
            )}
          </div>
        </div>
      </div>

      <div className="card-white">
        <h2 className="card-title" style={{ marginBottom: 20 }}>Manual Entry</h2>
        <div className="search-bar" style={{ marginBottom: 0 }}>
          <input className="form-input" type="text" placeholder="Enter ticket ID…" value={manualId} onChange={(e) => setManualId(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && validateTicket(manualId)} />
          <button className="btn btn-primary" onClick={() => validateTicket(manualId)}>Validate</button>
        </div>
      </div>

      {result && (
        <div className={`card-white validation-card ${result.status}`}>
          <div className="validation-header">
            <span className={`badge ${result.status === 'valid' ? 'badge-green' : result.status === 'used' ? 'badge-orange' : 'badge-ink'}`} style={{ fontSize: 14, padding: '8px 16px' }}>
              {result.status === 'valid' ? 'VALID' : result.status === 'used' ? 'USED' : 'INVALID'}
            </span>
            <span className="validation-status">{result.status === 'valid' ? 'Ticket is valid' : result.status === 'used' ? 'Ticket already used' : 'Ticket not found'}</span>
            <span className="validation-time">{result.timestamp}</span>
          </div>
          <div className="validation-details">
            <div><span className="validation-field-label">Ticket ID</span><span className="validation-field-value">{result.id}</span></div>
            <div><span className="validation-field-label">Event</span><span className="validation-field-value">{result.event}</span></div>
            <div><span className="validation-field-label">Type</span><span className="validation-field-value">{result.type}</span></div>
            <div><span className="validation-field-label">Row / Seat</span><span className="validation-field-value">{result.row} / {result.seat}</span></div>
          </div>
        </div>
      )}

      <div className="card-white">
        <div className="section-row">
          <h2 className="card-title" style={{ margin: 0 }}>Recent Scans</h2>
          <span className="scans-count">{scans.length} scans</span>
        </div>
        {scans.length === 0 ? (
          <div className="scanner-empty">
            <div className="scanner-empty-icon">&#128269;</div>
            <p className="scanner-empty-text">No scans yet. Scan a ticket to see results here.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Event</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {scans.map((s, i) => (
                  <tr key={i}>
                    <td className="mono">{s.id}</td>
                    <td>{s.event}</td>
                    <td>{s.type}</td>
                    <td><span className={`badge ${s.status === 'valid' ? 'badge-green' : s.status === 'used' ? 'badge-orange' : 'badge-ink'}`}>{s.status.toUpperCase()}</span></td>
                    <td>{s.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  )
}
