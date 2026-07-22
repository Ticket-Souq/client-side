import { useState, type FormEvent } from 'react'
import { Button } from '../../../shared/components/form/Button/Button'
import { Input } from '../../../shared/components/form/Input/Input'
import { Select } from '../../../shared/components/form/Select/Select'
import { CATEGORIES } from '../constants/categories'
import type { CreateEventRequest, EventMode, EventVisibility } from '../types/event.types'

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
    visibility: 'PUBLIC' as EventVisibility,
  })

  const [tagInput, setTagInput] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  const set = (key: keyof CreateEventRequest, value: unknown) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) => {
      const next = prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
      set('category', next.join(', '))
      return next
    })
  }

  const addTag = (val: string) => {
    const trimmed = val.trim()
    if (trimmed && !form.tags.includes(trimmed)) {
      set('tags', [...form.tags, trimmed])
    }
  }

  const removeTag = (tag: string) => {
    set('tags', form.tags.filter((t) => t !== tag))
  }

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag(tagInput)
      setTagInput('')
    }
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
          <label className="form-label">Event URL</label>
          <div className="url-input-group">
            <span className="url-prefix">ticketsouq.com/events/</span>
            <input
              type="text"
              className="form-input"
              placeholder="nile-nights-festival"
              value={form.slug}
              onChange={(e) => set('slug', e.target.value)}
            />
          </div>
          <p className="form-hint">This will be the public link to your event page</p>
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
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
          <div className="zone-info">
            <span className="zone-info-icon">📍</span>
            <div className="zone-info-text">
              <strong>Zone-based events</strong> let you sell tickets by area (e.g. VIP, General, Floor) without assigning individual seats. You'll configure zones and pricing after creating the event.
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Additional Settings */}
      <div className="form-section">
        <h2 className="form-section-title">Additional Settings</h2>
        <div className="form-group">
          <label className="form-label">Category</label>
          <div className="category-chips">
            {CATEGORIES.slice(0, 7).map((cat) => (
              <span
                key={cat}
                className={`category-chip${selectedCategories.includes(cat) ? ' active' : ''}`}
                onClick={() => toggleCategory(cat)}
              >
                {CATEGORY_EMOJI[cat] ?? '🏷️'} {cat}
              </span>
            ))}
          </div>
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Tags</label>
          <div className="tag-input-wrap">
            {form.tags.map((tag) => (
              <span key={tag} className="tag-pill">
                {tag} <button type="button" onClick={() => removeTag(tag)}>&times;</button>
              </span>
            ))}
            <input
              type="text"
              className="tag-input"
              placeholder="Add a tag and press Enter…"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
            />
          </div>
          <p className="form-hint">Press Enter to add a tag</p>
        </div>
      </div>

      {/* Section 4: Scheduling (extra for API) */}
      <div className="form-section">
        <h2 className="form-section-title">Scheduling</h2>
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
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">End date &amp; time</label>
            <input
              type="datetime-local"
              className="form-input"
              value={form.endDate}
              onChange={(e) => set('endDate', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Section 5: Visibility (extra for API) */}
      <div className="form-section">
        <h2 className="form-section-title">Visibility</h2>
        <div className="radio-group">
          <div className="radio-card">
            <input
              type="radio"
              name="visibility"
              id="vis-public"
              value="PUBLIC"
              checked={form.visibility === 'PUBLIC'}
              onChange={() => set('visibility', 'PUBLIC')}
            />
            <label htmlFor="vis-public">
              <span className="radio-indicator"></span>
              <span className="radio-icon">🌍</span>
              <span>
                Public
                <span className="radio-desc">Visible to everyone</span>
              </span>
            </label>
          </div>
          <div className="radio-card">
            <input
              type="radio"
              name="visibility"
              id="vis-private"
              value="PRIVATE"
              checked={form.visibility === 'PRIVATE'}
              onChange={() => set('visibility', 'PRIVATE')}
            />
            <label htmlFor="vis-private">
              <span className="radio-indicator"></span>
              <span className="radio-icon">🔒</span>
              <span>
                Private
                <span className="radio-desc">Invite only</span>
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Save as Draft</button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Creating…' : 'Create Event'}
        </button>
      </div>

    </form>
  )
}
