import { useState, useRef, useEffect, type FormEvent } from 'react'
import { Button } from '../../../shared/components/form/Button/Button'
import { CATEGORIES } from '../constants/categories'
import type { CreateEventRequest, EventMode } from '../types/event.types'

const CATEGORY_EMOJI: Record<string, string> = {
  Music: '🎵', Sports: '⚽', Theatre: '🎭', Conference: '🎤',
  Food: '🍕', Arts: '🎨', Family: '👨\u200d👩\u200d👧',
}

interface Props {
  onSubmit?: (data: CreateEventRequest) => void
  onCancel?: () => void
  loading?: boolean
}

export function EventCreateForm({ onSubmit, onCancel, loading }: Props) {
  const [form, setForm] = useState<CreateEventRequest>({
    name: '',
    slug: '',
    description: '',
    mode: 'SEAT_BASED' as EventMode,
    venueId: '',
    category: '',
    tags: [],
    startDate: '',
    endDate: '',
    visibility: 'PUBLIC',
  })

  const [catOpen, setCatOpen] = useState(false)
  const [catInput, setCatInput] = useState('')
  const [zoneSections, setZoneSections] = useState<{ name: string; price: string; capacity: string; reserved: string }[]>([])
  const catRef = useRef<HTMLDivElement>(null)
  const allCategories = [...new Set([...CATEGORIES, ...form.tags])].sort()

  const filteredCats = allCategories.filter((c) =>
    c.toLowerCase().includes(catInput.toLowerCase())
  )

  useEffect(() => {
    if (!catOpen) return
    const handleClick = (e: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node)) setCatOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [catOpen])

  const selectCategory = (cat: string) => {
    set('category', cat)
    setCatInput(cat)
    setCatOpen(false)
  }

  const addCustomCategory = () => {
    const trimmed = catInput.trim()
    if (trimmed) {
      set('category', trimmed)
      setCatOpen(false)
    }
  }

  const set = (key: keyof CreateEventRequest, value: unknown) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onSubmit?.(form)
  }

  const slugify = (text: string) =>
    text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim()

  return (
    <form id="createEventForm" onSubmit={handleSubmit}>

      {/* Section 1: Basic Information */}
      <div className="form-section">
        <h2 className="form-section-title">Basic Information</h2>
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <div className="form-group">
              <label className="form-label">Event name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Nile Nights Festival"
                value={form.name}
                onChange={(e) => {
                  set('name', e.target.value)
                  set('slug', slugify(e.target.value))
                }}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-input"
                placeholder="Tell attendees what to expect at your event…"
                rows={5}
                style={{ height: 'auto', padding: '16px 18px', resize: 'vertical', minHeight: 120 }}
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0, position: 'relative' }} ref={catRef}>
              <label className="form-label">Category</label>
              <input
                type="text"
                className="form-input"
                placeholder="Search or type a category…"
                value={catInput}
                onFocus={() => { setCatOpen(true); setCatInput('') }}
                onChange={(e) => { setCatInput(e.target.value); setCatOpen(true) }}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomCategory() } }}
              />
              {catOpen && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
                  background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 12,
                  maxHeight: 200, overflowY: 'auto', marginTop: 4,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                }}>
                  {filteredCats.map((c) => (
                    <div
                      key={c}
                      onClick={() => selectCategory(c)}
                      style={{
                        padding: '10px 16px', cursor: 'pointer', fontSize: 14,
                        fontFamily: "'Inter', sans-serif", color: 'var(--ink)',
                        background: form.category === c ? 'var(--yellow-pale, #fff6d9)' : 'transparent',
                        transition: 'background 100ms ease',
                      }}
                      onMouseEnter={(e) => { if (form.category !== c) e.currentTarget.style.background = '#f5f4ef' }}
                      onMouseLeave={(e) => { if (form.category !== c) e.currentTarget.style.background = 'transparent' }}
                    >
                      {CATEGORY_EMOJI[c] ?? '🏷️'} {c}
                    </div>
                  ))}
                  {catInput.trim() && !allCategories.some((c) => c.toLowerCase() === catInput.toLowerCase()) && (
                    <div
                      onClick={addCustomCategory}
                      style={{
                        padding: '10px 16px', cursor: 'pointer', fontSize: 14,
                        fontFamily: "'Inter', sans-serif", color: 'var(--text-secondary)',
                        borderTop: '1px solid var(--border)',
                      }}
                    >
                      + Add "{catInput.trim()}"
                    </div>
                  )}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 20 }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Start date &amp; time</label>
                <input
                  type="datetime-local"
                  className="form-input"
                  value={form.startDate}
                  onChange={(e) => set('startDate', e.target.value)}
                />
              </div>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label className="form-label">End date &amp; time</label>
                <input
                  type="datetime-local"
                  className="form-input"
                  value={form.endDate}
                  onChange={(e) => set('endDate', e.target.value)}
                />
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Venue</label>
              <select className="form-select" value={form.venueId} onChange={(e) => set('venueId', e.target.value)}>
                <option value="">Select a venue</option>
                <option value="cairo-arena">Cairo Arena — New Cairo</option>
                <option value="cairo-festival">Cairo Festival Grounds — New Cairo</option>
                <option value="opera-house">Cairo Opera House — Zamalek</option>
                <option value="downtown-venue">Downtown Cultural Center — Downtown</option>
                <option value="alex-arena">Alexandria Arena — Smouha</option>
              </select>
            </div>
          </div>
          <div style={{ flexShrink: 0, width: 220 }}>
            <label className="form-label">Poster image</label>
            <div
              style={{
                border: '2px dashed var(--border)',
                borderRadius: 14,
                padding: '32px 16px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'border-color 150ms ease, background 150ms ease',
                background: '#fafaf7',
                width: 220,
                minHeight: 280,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onClick={() => {}}
            >
              <div style={{ fontSize: 36, marginBottom: 8 }}>🖼️</div>
              <p style={{ margin: 0, fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>
                Upload poster
              </p>
              <p style={{ margin: '4px 0 0', fontFamily: "'Inter', sans-serif", fontSize: 12, color: 'var(--text-secondary)' }}>
                JPG, PNG or WebP
              </p>
              <p style={{ margin: '4px 0 0', fontFamily: "'Inter', sans-serif", fontSize: 12, color: 'var(--text-secondary)' }}>
                Recommended 600×900px
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Event Type */}
      <div className="form-section">
        <h2 className="form-section-title">Event Type</h2>
        <div className="radio-group">
          <div className="radio-card">
            <input
              type="radio"
              name="eventType"
              id="typeSeat"
              value="SEAT_BASED"
              checked={form.mode === 'SEAT_BASED'}
              onChange={() => set('mode', 'SEAT_BASED')}
            />
            <label htmlFor="typeSeat">
              <span className="radio-indicator"></span>
              <span className="radio-icon">💺</span>
              <span>
                Seat-Based
                <span className="radio-desc">Assign specific seats from a venue layout</span>
              </span>
            </label>
          </div>
          <div className="radio-card">
            <input
              type="radio"
              name="eventType"
              id="typeZone"
              value="ZONE_BASED"
              checked={form.mode === 'ZONE_BASED'}
              onChange={() => set('mode', 'ZONE_BASED')}
            />
            <label htmlFor="typeZone">
              <span className="radio-indicator"></span>
              <span className="radio-icon">📍</span>
              <span>
                Zone-Based
                <span className="radio-desc">Sell tickets by area or section</span>
              </span>
            </label>
          </div>
        </div>

        {/* Seat-Based conditional fields */}
        <div className={`conditional-section${form.mode === 'SEAT_BASED' ? ' visible' : ''}`}>
          <div className="form-group">
            <label className="form-label">Venue template</label>
            <select className="form-select">
              <option value="">Select a template</option>
              <option value="classic-theatre">Classic Theatre — 120 seats</option>
              <option value="concert-bowl">Concert Bowl — 500 seats</option>
              <option value="banquet-hall">Banquet Hall — 200 seats</option>
              <option value="classroom">Classroom Style — 80 seats</option>
              <option value="outdoor-stage">Outdoor Stage — 1,000 seats</option>
              <option value="vip-lounge">VIP Lounge — 40 seats</option>
            </select>
          </div>
          {/* Seat Grid Preview */}
          <div className="seat-preview">
            <p className="seat-preview-title">Classic Theatre Layout</p>
            <div className="seat-grid-compact">
              <div className="seat-stage">Stage</div>

              <div className="section-label">— Orchestra —</div>
              <div className="seat"></div><div className="seat"></div><div className="seat"></div><div className="seat"></div><div className="seat"></div>
              <div className="seat-aisle"></div><div className="seat-aisle"></div>
              <div className="seat"></div><div className="seat"></div><div className="seat"></div><div className="seat"></div><div className="seat"></div>
              <div className="seat"></div><div className="seat"></div><div className="seat"></div><div className="seat"></div><div className="seat"></div>
              <div className="seat-aisle"></div><div className="seat-aisle"></div>
              <div className="seat"></div><div className="seat"></div><div className="seat"></div><div className="seat"></div><div className="seat"></div>
              <div className="seat"></div><div className="seat"></div><div className="seat"></div><div className="seat"></div><div className="seat"></div>
              <div className="seat-aisle"></div><div className="seat-aisle"></div>
              <div className="seat"></div><div className="seat"></div><div className="seat"></div><div className="seat"></div><div className="seat"></div>
              <div className="seat"></div><div className="seat"></div><div className="seat"></div><div className="seat"></div><div className="seat"></div>
              <div className="seat-aisle"></div><div className="seat-aisle"></div>
              <div className="seat"></div><div className="seat"></div><div className="seat"></div><div className="seat"></div><div className="seat"></div>

              <div className="section-label">— Mezzanine —</div>
              <div className="seat"></div><div className="seat"></div><div className="seat"></div><div className="seat"></div>
              <div className="seat-aisle"></div><div className="seat-aisle"></div><div className="seat-aisle"></div><div className="seat-aisle"></div>
              <div className="seat"></div><div className="seat"></div><div className="seat"></div><div className="seat"></div>
              <div className="seat"></div><div className="seat"></div><div className="seat"></div><div className="seat"></div>
              <div className="seat-aisle"></div><div className="seat-aisle"></div><div className="seat-aisle"></div><div className="seat-aisle"></div>
              <div className="seat"></div><div className="seat"></div><div className="seat"></div><div className="seat"></div>

              <div className="section-label">— Balcony —</div>
              <div className="seat"></div><div className="seat"></div><div className="seat"></div>
              <div className="seat-aisle"></div><div className="seat-aisle"></div><div className="seat-aisle"></div><div className="seat-aisle"></div><div className="seat-aisle"></div><div className="seat-aisle"></div>
              <div className="seat"></div><div className="seat"></div><div className="seat"></div>
              <div className="seat"></div><div className="seat"></div><div className="seat"></div>
              <div className="seat-aisle"></div><div className="seat-aisle"></div><div className="seat-aisle"></div><div className="seat-aisle"></div><div className="seat-aisle"></div><div className="seat-aisle"></div>
              <div className="seat"></div><div className="seat"></div><div className="seat"></div>
            </div>
          </div>
        </div>

        {/* Zone-Based conditional fields */}
        <div className={`conditional-section${form.mode === 'ZONE_BASED' ? ' visible' : ''}`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {zoneSections.map((z, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 120px 120px 120px 40px', gap: 10, alignItems: 'end' }}>
                <div>
                  {i === 0 && <label className="form-label" style={{ fontSize: 12 }}>Zone Name</label>}
                  <input type="text" className="form-input" placeholder="e.g. VIP" value={z.name} onChange={(e) => setZoneSections((prev) => prev.map((s, j) => j === i ? { ...s, name: e.target.value } : s))} style={{ height: 42 }} />
                </div>
                <div>
                  {i === 0 && <label className="form-label" style={{ fontSize: 12 }}>Price</label>}
                  <input type="number" className="form-input" placeholder="0" value={z.price} onChange={(e) => setZoneSections((prev) => prev.map((s, j) => j === i ? { ...s, price: e.target.value } : s))} style={{ height: 42 }} />
                </div>
                <div>
                  {i === 0 && <label className="form-label" style={{ fontSize: 12 }}>Capacity</label>}
                  <input type="number" className="form-input" placeholder="0" value={z.capacity} onChange={(e) => setZoneSections((prev) => prev.map((s, j) => j === i ? { ...s, capacity: e.target.value } : s))} style={{ height: 42 }} />
                </div>
                <div>
                  {i === 0 && <label className="form-label" style={{ fontSize: 12 }}>Reserved</label>}
                  <input type="number" className="form-input" placeholder="0" value={z.reserved} onChange={(e) => setZoneSections((prev) => prev.map((s, j) => j === i ? { ...s, reserved: e.target.value } : s))} style={{ height: 42 }} />
                </div>
                <button type="button" onClick={() => setZoneSections((prev) => prev.filter((_, j) => j !== i))} style={{ height: 42, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 18, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>&times;</button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setZoneSections((prev) => [...prev, { name: '', price: '', capacity: '', reserved: '' }])}
            style={{
              marginTop: 14, width: '100%', padding: '12px 0', borderRadius: 12,
              border: '2px dashed var(--border)', background: 'transparent',
              cursor: 'pointer', fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 600,
              color: 'var(--ink)', transition: 'border-color 150ms ease, background 150ms ease',
            }}
          >
            + Add Section
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Creating…' : 'Create Event'}
        </button>
      </div>

    </form>
  )
}
