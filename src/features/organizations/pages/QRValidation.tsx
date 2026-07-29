import { useState, useCallback } from 'react'
import './QRValidation.css'

export default function QRValidation() {
  const [scanning, setScanning] = useState(false)
  const [manualId, setManualId] = useState('')

  const validateTicket = useCallback((id: string) => {
    if (!id.trim()) return
    alert(`Ticket ${id} validated`)
    setManualId('')
  }, [])

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
    </main>
  )
}
