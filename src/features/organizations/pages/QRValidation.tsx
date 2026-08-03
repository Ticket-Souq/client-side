import { useState, useCallback, useEffect, useRef } from 'react'
import jsQR from 'jsqr'
import './QRValidation.css'
import { getTicketById, consumeTicket, cancelTicket } from '../../tickets/services/ticketService'
import type { TicketResponse } from '../../tickets/types/ticket.types'
import { formatEventDate, formatPrice, formatDateTime } from '../../../shared/format'

type ValidationResult =
  | { kind: 'success'; ticket: TicketResponse }
  | { kind: 'error'; message: string }

function extractTicketId(raw: string): string {
  return raw.trim().split('/').filter(Boolean).pop() ?? ''
}

export default function QRValidation() {
  const [scanning, setScanning] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [manualId, setManualId] = useState('')
  const [result, setResult] = useState<ValidationResult | null>(null)
  const [validating, setValidating] = useState(false)
  const [consuming, setConsuming] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number>(0)
  const lastFrameRef = useRef(0)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const stopStream = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = 0
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
  }, [])

  useEffect(() => {
    return () => stopStream()
  }, [stopStream])

  const stopScanning = useCallback(() => {
    stopStream()
    setScanning(false)
  }, [stopStream])

  const validateTicket = useCallback(async (raw: string) => {
    const id = extractTicketId(raw)
    if (!id) {
      setResult({ kind: 'error', message: 'No ticket ID found in that input.' })
      return
    }
    setResult(null)
    setValidating(true)
    try {
      const ticket = await getTicketById(id)
      if (!ticket) throw new Error('Ticket not found')
      setResult({ kind: 'success', ticket })
    } catch (err) {
      const message = err instanceof Error && err.message ? err.message : 'Ticket not found'
      setResult({ kind: 'error', message })
    } finally {
      setValidating(false)
    }
  }, [])

  const decodeLoop = useCallback(() => {
    const video = videoRef.current
    if (!video || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(decodeLoop)
      return
    }
    const now = performance.now()
    if (now - lastFrameRef.current >= 250) {
      lastFrameRef.current = now
      const w = video.videoWidth
      const h = video.videoHeight
      if (w && h) {
        if (!canvasRef.current) canvasRef.current = document.createElement('canvas')
        const canvas = canvasRef.current
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        if (ctx) {
          ctx.drawImage(video, 0, 0, w, h)
          const imageData = ctx.getImageData(0, 0, w, h)
          const code = jsQR(imageData.data, w, h)
          if (code?.data) {
            stopScanning()
            validateTicket(code.data)
            return
          }
        }
      }
    }
    rafRef.current = requestAnimationFrame(decodeLoop)
  }, [stopScanning, validateTicket])

  const startScanning = useCallback(async () => {
    setResult(null)
    setCameraError(null)
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('unsupported')
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      })
      streamRef.current = stream
      const video = videoRef.current
      if (video) {
        video.srcObject = stream
        await video.play().catch(() => {})
      }
      setScanning(true)
      lastFrameRef.current = 0
      rafRef.current = requestAnimationFrame(decodeLoop)
    } catch {
      setCameraError('Camera access denied or unavailable. Use manual entry below.')
    }
  }, [decodeLoop])

  const handleConsume = useCallback(async () => {
    if (!result || result.kind !== 'success' || result.ticket.consumed) return
    setConsuming(true)
    try {
      const updated = await consumeTicket(result.ticket.id)
      setResult({ kind: 'success', ticket: updated })
    } catch (err) {
      const message = err instanceof Error && err.message ? err.message : 'Failed to check in ticket'
      setResult({ kind: 'error', message })
    } finally {
      setConsuming(false)
    }
  }, [result])

  const handleCancel = useCallback(async () => {
    if (!result || result.kind !== 'success' || result.ticket.consumed) return
    setCancelling(true)
    try {
      const updated = await cancelTicket(result.ticket.id)
      setResult({ kind: 'success', ticket: updated })
    } catch (err) {
      const message = err instanceof Error && err.message ? err.message : 'Failed to cancel ticket'
      setResult({ kind: 'error', message })
    } finally {
      setCancelling(false)
    }
  }, [result])

  const scanAgain = useCallback(() => {
    setResult(null)
    startScanning()
  }, [startScanning])

  const seatLabel =
    result?.kind === 'success'
      ? result.ticket.ticketType === 'SEAT'
        ? `${result.ticket.row ?? ''}${result.ticket.seatNumber ?? ''}`.trim() || '—'
        : result.ticket.zoneCategory ?? '—'
      : '—'

  const displayStatus =
    result?.kind === 'success'
      ? result.ticket.consumed
        ? 'Checked in'
        : result.ticket.reservationStatus === 'CANCELLED'
          ? 'Cancelled'
          : 'Valid Ticket'
      : ''

  return (
    <main className="wrap">
      <div className="page-title-row">
        <h1 className="section-title" style={{ margin: 0 }}>QR Scanner</h1>
      </div>

      <div className="card-white">
        <div className="scanner-wrap">
          <p className="scanner-label">Scan Ticket</p>
          <div className={`scanner-viewport ${scanning ? 'scanning' : ''}`}>
            <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', background: 'var(--ink-black)' }} />
            <div className="scanner-overlay">
              <div className="scanner-frame">
                <div className="scanner-corner tl"></div>
                <div className="scanner-corner tr"></div>
                <div className="scanner-corner bl"></div>
                <div className="scanner-corner br"></div>
              </div>
              <div className="scan-line"></div>
            </div>
            {scanning && <div className="scanner-status">Scanning…</div>}
            {!scanning && (
              <div className="no-camera" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="no-camera-icon" style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--surface-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>&#128247;</div>
                <p className="no-camera-text">{cameraError ?? 'Camera not available. Use manual entry below.'}</p>
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

      {validating && (
        <div className="card-white">
          <p className="scanner-empty-text">Looking up ticket…</p>
        </div>
      )}

      {result && (
        <div className="card-white">
          {result.kind === 'error' ? (
            <div className="validation-card invalid">
              <div className="validation-header">
                <span className="validation-status">Invalid Ticket</span>
              </div>
              <p className="validation-msg">{result.message}</p>
              <div className="scanner-actions" style={{ marginTop: 20 }}>
                <button className="btn btn-primary" onClick={scanAgain}>Scan Again</button>
              </div>
            </div>
          ) : (
            <div className={`validation-card ${result.ticket.consumed ? 'used' : result.ticket.reservationStatus === 'CANCELLED' ? 'invalid' : 'valid'}`}>
              <div className="validation-header">
                <span className="validation-status">{displayStatus}</span>
                <span className="validation-time">{formatPrice(result.ticket.price)}</span>
              </div>
              <p className="validation-event">{result.ticket.eventTitle}</p>
              <div className="validation-details">
                <div className="validation-field">
                  <span className="validation-field-label">Holder</span>
                  <span className="validation-field-value">{result.ticket.holderName ?? '—'}</span>
                </div>
                <div className="validation-field">
                  <span className="validation-field-label">Ticket type</span>
                  <span className="validation-field-value">{result.ticket.ticketType}</span>
                </div>
                <div className="validation-field">
                  <span className="validation-field-label">Seat / Zone</span>
                  <span className="validation-field-value">{seatLabel}</span>
                </div>
                <div className="validation-field">
                  <span className="validation-field-label">Category</span>
                  <span className="validation-field-value">{result.ticket.seatCategory ?? result.ticket.zoneCategory ?? '—'}</span>
                </div>
                <div className="validation-field">
                  <span className="validation-field-label">Event date</span>
                  <span className="validation-field-value">{formatEventDate(result.ticket.eventStartDate, result.ticket.eventFinishDate)}</span>
                </div>
                <div className="validation-field">
                  <span className="validation-field-label">Event status</span>
                  <span className="validation-field-value">{result.ticket.eventStatus}</span>
                </div>
                <div className="validation-field">
                  <span className="validation-field-label">Reservation</span>
                  <span className="validation-field-value">{result.ticket.reservationStatus}</span>
                </div>
                <div className="validation-field">
                  <span className="validation-field-label">Created</span>
                  <span className="validation-field-value">{formatDateTime(result.ticket.createdAt)}</span>
                </div>
                <div className="validation-field validation-field--full">
                  <span className="validation-field-label">Ticket ID</span>
                  <span className="validation-field-value validation-id">{result.ticket.id}</span>
                </div>
                <div className="validation-field validation-field--full">
                  <span className="validation-field-label">Event ID</span>
                  <span className="validation-field-value validation-id">{result.ticket.eventId}</span>
                </div>
              </div>
              {result.ticket.consumed ? (
                <p className="validation-note">This ticket has already been checked in.</p>
              ) : result.ticket.reservationStatus === 'CANCELLED' ? (
                <p className="validation-note">This ticket has been cancelled.</p>
              ) : (
                <div className="scanner-actions" style={{ marginTop: 20 }}>
                  <button className="btn btn-primary" onClick={handleConsume} disabled={consuming}>
                    {consuming ? 'Checking in…' : 'Check in ticket'}
                  </button>
                  <button className="btn btn-danger" onClick={handleCancel} disabled={cancelling}>
                    {cancelling ? 'Cancelling…' : 'Cancel ticket'}
                  </button>
                  <button className="btn btn-ghost" onClick={scanAgain}>Scan Again</button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="card-white">
        <h2 className="card-title" style={{ marginBottom: 20 }}>Manual Entry</h2>
        <div className="search-bar" style={{ marginBottom: 0 }}>
          <input className="form-input" type="text" placeholder="Enter ticket ID or URL…" value={manualId} onChange={(e) => setManualId(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && validateTicket(manualId)} />
          <button className="btn btn-primary" onClick={() => validateTicket(manualId)}>Validate</button>
        </div>
      </div>
    </main>
  )
}
