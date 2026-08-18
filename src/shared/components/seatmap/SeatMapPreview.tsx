import { useState, useMemo, Fragment } from 'react'
import type { SeatMap, Row, VerticalAisle } from '../../../features/venues/components/types'

export interface SeatReservation {
  cellId: string
  rowLabel: string
  seatNumber: string
  holderName: string
}

const CELL_SIZE = 18
const CELL_GAP = 3

function verticalAislesForRow(
  rowIndex: number,
  rows: Row[],
  verticalAisles: VerticalAisle[],
): VerticalAisle[] {
  return verticalAisles.filter((va) => {
    if (va.startRowId) {
      const si = rows.findIndex((r) => r.id === va.startRowId)
      if (si === -1 || rowIndex < si) return false
    }
    if (va.endRowId) {
      const ei = rows.findIndex((r) => r.id === va.endRowId)
      if (ei === -1 || rowIndex > ei) return false
    }
    return true
  })
}

export function SeatMapPreview({ map, reservations = [], onReserve, onUnreserve, onSeatSelect, selectedCellIds, cellSize = CELL_SIZE, cellGap = CELL_GAP }: {
  map: SeatMap
  reservations?: SeatReservation[]
  onReserve?: (r: SeatReservation) => void
  onUnreserve?: (cellId: string) => void
  onSeatSelect?: (cellId: string, rowLabel: string, seatNumber: string) => void
  selectedCellIds?: Set<string>
  cellSize?: number
  cellGap?: number
}) {
  const catById = useMemo(() => new Map(map.categories.map((c) => [c.id, c])), [map.categories])
  const reservedMap = useMemo(() => new Map(reservations.map((r) => [r.cellId, r])), [reservations])
  const [pendingCell, setPendingCell] = useState<{ rowLabel: string; seatNumber: string; cellId: string } | null>(null)
  const [nameInput, setNameInput] = useState('')

  const maxRowWidth = useMemo(() => {
    let max = 0
    for (let ri = 0; ri < map.rows.length; ri++) {
      const row = map.rows[ri]
      if (row.aisle) continue
      const rowAisles = verticalAislesForRow(ri, map.rows, map.verticalAisles)
      const itemCount = row.cells.length + rowAisles.length
      const itemsWidth = row.cells.length * cellSize + rowAisles.length * (cellSize * (4 / 3))
      const gapsWidth = Math.max(0, itemCount - 1) * cellGap
      const w = itemsWidth + gapsWidth
      if (w > max) max = w
    }
    return max || 1
  }, [map.rows, map.verticalAisles, cellSize, cellGap])

  const handleSeatClick = (cellId: string, rowLabel: string, seatNumber: string) => {
    if (reservedMap.has(cellId)) {
      onUnreserve?.(cellId)
      return
    }
    if (onSeatSelect) {
      onSeatSelect(cellId, rowLabel, seatNumber)
      return
    }
    setPendingCell({ cellId, rowLabel, seatNumber })
    setNameInput('')
  }

  const confirmReserve = () => {
    if (pendingCell && nameInput.trim()) {
      onReserve?.({ cellId: pendingCell.cellId, rowLabel: pendingCell.rowLabel, seatNumber: pendingCell.seatNumber, holderName: nameInput.trim() })
      setPendingCell(null)
      setNameInput('')
    }
  }

  return (
    <div style={{
      background: 'var(--color-bg)', borderRadius: 8, padding: 16, overflow: 'auto', display: 'flex', justifyContent: 'center', position: 'relative',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
      {map.stage.position === 'top' && (
        <div style={{
          background: '#7f1d1d', borderRadius: 4, padding: '6px 0',
          textAlign: 'center', fontWeight: 700, fontSize: 11, letterSpacing: 4,
          color: '#fff', marginBottom: 12, marginLeft: 24 + cellGap, width: maxRowWidth,
        }}>
          {map.stage.label || 'STAGE'}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {map.rows.map((row, ri) => {
          if (row.aisle) {
            return (
              <div key={row.id} style={{ display: 'flex', alignItems: 'center', gap: cellGap, marginBottom: cellGap, minHeight: 8, width: maxRowWidth + 24 + cellGap }}>
                <span style={{ width: 24, flexShrink: 0 }} />
                <div style={{ flex: 1, borderTop: '1px dashed var(--border)' }} />
              </div>
            )
          }
          const rowAisles = verticalAislesForRow(ri, map.rows, map.verticalAisles)
          return (
            <div key={row.id} style={{ display: 'flex', alignItems: 'center', gap: cellGap, marginBottom: cellGap }}>
              <span style={{ width: 24, fontSize: cellSize > 20 ? 12 : 10, color: 'var(--text-secondary)', textAlign: 'right', flexShrink: 0, paddingRight: 2 }}>
                {row.label}
              </span>
              <div style={{ display: 'flex', gap: cellGap, width: 'max-content', maxWidth: '100%' }}>
                {row.cells.map((cell, ci) => (
                  <Fragment key={cell.id}>
                    {cell.type !== 'seat' ? (
                      <div style={{ width: cellSize, height: cellSize, flexShrink: 0 }} />
                    ) : (() => {
                      const cat = cell.categoryId ? catById.get(cell.categoryId) : undefined
                      const res = reservedMap.get(cell.id)
                      const isReserved = !!res
                      const isSelected = selectedCellIds?.has(cell.id) ?? false
                      const seatFont = cellSize > 20 ? 11 : 8
                      return (
                        <div
                          title={isReserved ? `${row.label}${cell.number ?? ''} — ${res.holderName}` : `${row.label}${cell.number ?? ''}${cat ? ' · ' + cat.name : ''}`}
                          onClick={() => handleSeatClick(cell.id, row.label, cell.number ?? String(ci + 1))}
                          style={{
                            width: cellSize, height: cellSize, borderRadius: 3, flexShrink: 0,
                            backgroundColor: isReserved ? '#16a34a' : (cat?.color ?? '#3b82f6'),
                            opacity: isReserved ? 1 : (isSelected ? 1 : 0.8),
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: seatFont, color: '#000', fontWeight: 600,
                            border: isSelected ? '2px solid #fff' : '1px solid #000',
                            outline: isSelected ? '2px solid #2563eb' : 'none',
                            outlineOffset: isSelected ? 1 : 0,
                            cursor: 'pointer', transition: 'transform 100ms ease',
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.3)' }}
                          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
                        >
                          {cell.number ?? ''}
                        </div>
                      )
                    })()}
                    {rowAisles.filter((va) => va.columnIndex === ci).map((va) => (
                      <div key={va.id} style={{ width: cellSize * (4 / 3), height: cellSize, flexShrink: 0 }} />
                    ))}
                  </Fragment>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {map.stage.position === 'bottom' && (
        <div style={{
          background: '#000', borderRadius: 4, padding: '6px 0',
          textAlign: 'center', fontWeight: 700, fontSize: 11, letterSpacing: 4,
          color: '#fff', marginTop: 12, marginLeft: 24 + cellGap, width: maxRowWidth,
        }}>
          {map.stage.label || 'STAGE'}
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 12, paddingTop: 8, borderTop: '1px solid var(--border)', justifyContent: 'center', alignSelf: 'stretch' }}>
        {map.categories.map((c) => (
          <span key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--ink)' }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: c.color , border: '1px solid #000' }} />
            {c.name}
          </span>
        ))}
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--ink)' }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: '#16a34a', border: '1px solid #000' }} />
          Reserved
        </span>
        {selectedCellIds && selectedCellIds.size > 0 && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--ink)' }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: '#2563eb', border: '1px solid #fff' }} />
            Selected
          </span>
        )}
      </div>
      </div>

      {pendingCell && !onSeatSelect && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          onClick={() => setPendingCell(null)}
        >
          <div
            style={{ background: 'var(--white)', borderRadius: 12, padding: 24, width: 340, boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700 }}>Reserve seat</h3>
            <p style={{ margin: '0 0 14px', fontSize: 13, color: 'var(--text-secondary)' }}>
              Seat <strong>{pendingCell.rowLabel}{pendingCell.seatNumber}</strong> &mdash; enter holder name
            </p>
            <input
              autoFocus
              type="text"
              placeholder="e.g. John Smith"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') confirmReserve() }}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 14, boxSizing: 'border-box', marginBottom: 14, background: 'var(--white)', color: 'var(--ink)' }}
            />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setPendingCell(null)} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--white)', color: 'var(--ink)', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
              <button type="button" onClick={confirmReserve} disabled={!nameInput.trim()} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: nameInput.trim() ? '#16a34a' : '#d1d5db', color: '#fff', cursor: nameInput.trim() ? 'pointer' : 'not-allowed', fontSize: 13, fontWeight: 600 }}>Reserve</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}