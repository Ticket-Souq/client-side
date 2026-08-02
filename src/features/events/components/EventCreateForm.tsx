import { useState, useRef, useEffect, useMemo, type FormEvent } from 'react'
import type { CreateEventRequest, CreateSectionRequest, CreateSeatRequest, SeatStatus, EventReservation } from '../types/event.types'
import { EventApi } from '../services/eventApi'
import { listVenues, listVenueTemplates, getVenueTemplate } from '../../venues/api/venueApi'
import type { Venue, VenueTemplate, SeatMap } from '../../venues/components/types'
import { toast } from '../../../shared/components/display/Toast/Toast'
import { SeatMapPreview, type SeatReservation } from '../../../shared/components/seatmap/SeatMapPreview'

const CATEGORY_EMOJI: Record<string, string> = {
  Music: '🎵', Sports: '⚽', Theatre: '🎭', Conference: '🎤',
  Food: '🍕', Arts: '🎨', Family: '👨\u200d👩\u200d👧',
}

interface ZoneSection {
  name: string
  price: string
  capacity: string
}

interface CategoryPrice {
  id: string
  name: string
  color: string
  price: string
}

interface BuildRequestParams {
  form: EventFormState
  selectedVenue: Venue | null
  selectedTemplateId: string
  seatMap: SeatMap | null
  categoryPrices: CategoryPrice[]
  zoneSections: ZoneSection[]
  reservations: SeatReservation[]
  isSeatBased: boolean
}

function buildCreateRequest(params: BuildRequestParams): CreateEventRequest {
  const { form, selectedVenue, selectedTemplateId, seatMap, categoryPrices, zoneSections, reservations, isSeatBased } = params
  const reservedIds = new Set(reservations.map((r) => r.cellId))

  const sections: CreateSectionRequest[] = isSeatBased && seatMap
    ? seatMap.categories.map((cat) => {
        const priceEntry = categoryPrices.find((p) => p.id === cat.id)
        let capacity = 0
        const seats: CreateSeatRequest[] = []
        for (const row of seatMap.rows) {
          if (row.aisle) continue
          for (const cell of row.cells) {
            if (cell.type === 'seat' && cell.categoryId === cat.id) {
              capacity++
              const isReserved = reservedIds.has(cell.id)
              seats.push({
                id: cell.id,
                lable: `${row.label}${cell.number ?? ''}`,
                status: isReserved ? 'BOOKED_ORGANIZER' as SeatStatus : 'AVAILABLE' as SeatStatus,
              })
            }
          }
        }
        return {
          id: cat.id,
          name: cat.name,
          capacity,
          color: cat.color,
          price: priceEntry ? parseFloat(priceEntry.price) || null : null,
          seats,
        }
      })
    : zoneSections.map((z) => ({
        id: crypto.randomUUID(),
        name: z.name,
        capacity: parseInt(z.capacity) || 0,
        color: `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0')}`,
        price: parseFloat(z.price) || null,
        seats: [],
      }))

  const eventReservations: EventReservation[] = isSeatBased && seatMap
    ? reservations.map((r) => {
        let sectionName = ''
        let price = 0
        for (const row of seatMap.rows) {
          for (const cell of row.cells) {
            if (cell.id === r.cellId && cell.categoryId) {
              const cat = seatMap.categories.find((c) => c.id === cell.categoryId)
              if (cat) {
                sectionName = cat.name
                const priceEntry = categoryPrices.find((p) => p.id === cat.id)
                price = priceEntry ? parseFloat(priceEntry.price) || 0 : 0
              }
            }
          }
        }
        return {
          price,
          label: `${r.rowLabel}${r.seatNumber}`,
          sectionName,
          holderName: r.holderName,
        }
      })
    : []

  return {
    title: form.name,
    description: form.description,
    location: selectedVenue?.address ?? '',
    venueTemplateId: isSeatBased ? selectedTemplateId : null,
    eventCategoryName: form.category,
    bookingModel: isSeatBased ? 'SEAT' : 'ZONE',
    startDate: new Date(form.startDate).toISOString(),
    finishDate: new Date(form.endDate).toISOString(),
    sections,
    reservations: eventReservations,
  }
}

interface EventFormState {
  name: string
  description: string
  category: string
  startDate: string
  endDate: string
}

interface Props {
  onSubmit?: (data: CreateEventRequest, posterFile: File | null, bannerFile: File | null) => void
  onCancel?: () => void
  loading?: boolean
}

export function EventCreateForm({ onSubmit, loading }: Props) {
  const [form, setForm] = useState<EventFormState>({
    name: '',
    description: '',
    category: '',
    startDate: '',
    endDate: '',
  })

  const [venueId, setVenueId] = useState('')
  const [tags] = useState<string[]>([])
  const [dbCategories, setDbCategories] = useState<string[]>([])

  const [catOpen, setCatOpen] = useState(false)
  const [catInput, setCatInput] = useState('')
  const catRef = useRef<HTMLDivElement>(null)
  const allCategories = [...new Set([...dbCategories, ...tags])].sort()
  const filteredCats = allCategories.filter((c) =>
    c.toLowerCase().includes(catInput.toLowerCase())
  )

  const [venues, setVenues] = useState<Venue[]>([])
  const [venuesLoading, setVenuesLoading] = useState(true)

  const [templates, setTemplates] = useState<VenueTemplate[]>([])
  const [templatesLoading, setTemplatesLoading] = useState(false)
  const [selectedTemplateId, setSelectedTemplateId] = useState('')

  const [seatMap, setSeatMap] = useState<SeatMap | null>(null)
  const [seatMapLoading, setSeatMapLoading] = useState(false)

  const [categoryPrices, setCategoryPrices] = useState<CategoryPrice[]>([])
  const [zoneSections, setZoneSections] = useState<ZoneSection[]>([])
  const [reservations, setReservations] = useState<SeatReservation[]>([])
  const [posterFile, setPosterFile] = useState<File | null>(null)
  const [posterPreview, setPosterPreview] = useState<string>('')
  const posterInputRef = useRef<HTMLInputElement>(null)
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [bannerPreview, setBannerPreview] = useState<string>('')
  const bannerInputRef = useRef<HTMLInputElement>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const selectedVenue = useMemo(
    () => venues.find((v) => v.id === venueId) ?? null,
    [venues, venueId],
  )

  const isSeatBased = selectedVenue?.type === 'SEAT_BASED'

  useEffect(() => {
    let cancelled = false
    setVenuesLoading(true)
    ;(async () => {
      try {
        const res = await listVenues(0, 100)
        if (!cancelled) setVenues(res.content)
      } catch {
        // silently fail
      } finally {
        if (!cancelled) setVenuesLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const cats = await EventApi.getCategories()
        if (!cancelled) setDbCategories(cats)
      } catch {
        // silently fail
      }
    })()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!venueId) return
    setSelectedTemplateId('')
    setSeatMap(null)
    setCategoryPrices([])
    setZoneSections([])
    setReservations([])

    if (!selectedVenue) return

    if (selectedVenue.type === 'SEAT_BASED') {
      let cancelled = false
      setTemplatesLoading(true)
      ;(async () => {
        try {
          const list = await listVenueTemplates(selectedVenue.id)
          if (!cancelled) setTemplates(list)
        } catch {
          if (!cancelled) setTemplates([])
        } finally {
          if (!cancelled) setTemplatesLoading(false)
        }
      })()
      return () => { cancelled = true }
    }
  }, [venueId])

  useEffect(() => {
    if (!selectedTemplateId || !selectedVenue) return
    let cancelled = false
    setSeatMapLoading(true)
    ;(async () => {
      try {
        const tpl = await getVenueTemplate(selectedVenue.id, selectedTemplateId)
        if (cancelled) return
        const parsed = JSON.parse(tpl.layout) as SeatMap
        if (parsed && parsed.rows) {
          setSeatMap(parsed)
          setCategoryPrices(
            parsed.categories.map((c) => ({
              id: c.id,
              name: c.name,
              color: c.color,
              price: '',
            })),
          )
        }
      } catch {
        if (!cancelled) setSeatMap(null)
      } finally {
        if (!cancelled) setSeatMapLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [selectedTemplateId])


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

  const set = (key: keyof EventFormState, value: unknown) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handlePosterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return
    setPosterFile(file)
    setPosterPreview(URL.createObjectURL(file))
  }

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return
    setBannerFile(file)
    setBannerPreview(URL.createObjectURL(file))
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setFieldErrors({})

    const errs: Record<string, string> = {}
    if (!form.name.trim()) errs.name = 'Event name is required'
    if (!form.description.trim()) errs.description = 'Description is required'
    if (!form.category.trim()) errs.category = 'Category is required'
    if (!form.startDate) errs.startDate = 'Start date & time is required'
    if (!form.endDate) errs.endDate = 'End date & time is required'
    if (form.startDate && form.endDate && new Date(form.endDate) <= new Date(form.startDate)) errs.endDate = 'End date must be after start date'
    if (!venueId) errs.venueId = 'Venue is required'
    if (!posterFile) errs.poster = 'Poster image is required'
    if (isSeatBased && !selectedTemplateId) errs.templateId = 'Venue template is required'
    if (isSeatBased && categoryPrices.some((p) => !p.price || parseFloat(p.price) <= 0)) errs.categoryPrices = 'All category prices must be set'
    if (!isSeatBased && zoneSections.length === 0) errs.zoneSections = 'At least one zone section is required'
    if (!isSeatBased && zoneSections.some((z) => !z.name.trim())) errs.zoneSections = 'All zone sections must have a name'
    if (!isSeatBased && zoneSections.some((z) => !z.price || parseFloat(z.price) <= 0)) errs.zoneSections = 'All zone sections must have a price'
    if (!isSeatBased && zoneSections.some((z) => !z.capacity || parseInt(z.capacity) <= 0)) errs.zoneSections = 'All zone sections must have a capacity'

    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs)
      toast(Object.values(errs)[0], 'error')
      return
    }

    const request = buildCreateRequest({
      form,
      selectedVenue,
      selectedTemplateId,
      seatMap,
      categoryPrices,
      zoneSections,
      reservations,
      isSeatBased,
    })
    onSubmit?.(request, posterFile, bannerFile)
  }

  return (
    <>
      <form id="createEventForm" onSubmit={handleSubmit} noValidate>

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
                onChange={(e) => set('name', e.target.value)}
              />
              {fieldErrors.name && <span style={{ display:'block', color:'#dc2626', fontSize:12, marginTop:4 }}>{fieldErrors.name}</span>}
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
              {fieldErrors.description && <span style={{ display:'block', color:'#dc2626', fontSize:12, marginTop:4 }}>{fieldErrors.description}</span>}
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
              {fieldErrors.category && <span style={{ display:'block', color:'#dc2626', fontSize:12, marginTop:4 }}>{fieldErrors.category}</span>}
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
                  {fieldErrors.startDate && <span style={{ display:'block', color:'#dc2626', fontSize:12, marginTop:4 }}>{fieldErrors.startDate}</span>}
                </div>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label className="form-label">End date &amp; time</label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={form.endDate}
                    onChange={(e) => set('endDate', e.target.value)}
                  />
                  {fieldErrors.endDate && <span style={{ display:'block', color:'#dc2626', fontSize:12, marginTop:4 }}>{fieldErrors.endDate}</span>}
                </div>
            </div>
          </div>
          <div style={{ flexShrink: 0, width: 220 }}>
            <label className="form-label">Poster image</label>
            <input
              ref={posterInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              style={{ display: 'none' }}
              onChange={handlePosterChange}
            />
            <div
              style={{
                border: '2px dashed var(--border)',
                borderRadius: 14,
                padding: posterPreview ? 0 : '32px 16px',
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
                overflow: 'hidden',
              }}
              onClick={() => posterInputRef.current?.click()}
            >
              {posterPreview ? (
                <img
                  src={posterPreview}
                  alt="Poster preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12 }}
                />
              ) : (
                <>
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
                </>
              )}
            </div>
            {fieldErrors.poster && <span style={{ display:'block', color:'#dc2626', fontSize:12, marginTop:6, textAlign:'center' }}>{fieldErrors.poster}</span>}
          </div>
          <div style={{ flexShrink: 0, width: 220 }}>
            <label className="form-label">Banner image</label>
            <input
              ref={bannerInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              style={{ display: 'none' }}
              onChange={handleBannerChange}
            />
            <div
              style={{
                border: '2px dashed var(--border)',
                borderRadius: 14,
                padding: bannerPreview ? 0 : '32px 16px',
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
                overflow: 'hidden',
              }}
              onClick={() => bannerInputRef.current?.click()}
            >
              {bannerPreview ? (
                <img
                  src={bannerPreview}
                  alt="Banner preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12 }}
                />
              ) : (
                <>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>🖼️</div>
                  <p style={{ margin: 0, fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>
                    Upload banner
                  </p>
                  <p style={{ margin: '4px 0 0', fontFamily: "'Inter', sans-serif", fontSize: 12, color: 'var(--text-secondary)' }}>
                    JPG, PNG or WebP
                  </p>
                  <p style={{ margin: '4px 0 0', fontFamily: "'Inter', sans-serif", fontSize: 12, color: 'var(--text-secondary)' }}>
                    Recommended 1920×1080px
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Venue & Layout */}
      <div className="form-section">
        <h2 className="form-section-title">Venue & Layout</h2>

        {/* Venue selector */}
        <div className="form-group">
          <label className="form-label">Venue</label>
          <select
            className="form-select"
            value={venueId}
            onChange={(e) => setVenueId(e.target.value)}
            disabled={venuesLoading}
          >
            <option value="">{venuesLoading ? 'Loading venues…' : 'Select a venue'}</option>
            {venues.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} — {v.address} ({v.type === 'SEAT_BASED' ? 'Seat-based' : 'Zone-based'})
              </option>
            ))}
          </select>
          {fieldErrors.venueId && <span style={{ display:'block', color:'#dc2626', fontSize:12, marginTop:4 }}>{fieldErrors.venueId}</span>}
        </div>

        {/* Seat-based: template + seat map + category pricing */}
        {isSeatBased && (
          <div style={{ marginTop: 16 }}>
            <div className="form-group">
              <label className="form-label">Venue template</label>
              <select
                className="form-select"
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                disabled={templatesLoading}
              >
                <option value="">{templatesLoading ? 'Loading templates…' : 'Select a template'}</option>
                {templates.map((t) => {
                  let label = t.id.slice(0, 8)
                  try {
                    const parsed = JSON.parse(t.layout) as SeatMap
                    if (parsed.name) label = parsed.name
                  } catch { /* keep fallback */ }
                  return (
                    <option key={t.id} value={t.id}>{label}</option>
                  )
                })}
              </select>
              {fieldErrors.templateId && <span style={{ display:'block', color:'#dc2626', fontSize:12, marginTop:4 }}>{fieldErrors.templateId}</span>}
            </div>

            {/* Seat map preview */}
            {selectedTemplateId && (
              <div style={{ marginTop: 12 }}>
                {seatMapLoading ? (
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Loading seat map…</p>
                ) : seatMap ? (
                  <SeatMapPreview map={seatMap} reservations={reservations} onReserve={(r) => setReservations((prev) => [...prev, r])} onUnreserve={(cellId) => setReservations((prev) => prev.filter((r) => r.cellId !== cellId))} />
                ) : (
                  <p style={{ fontSize: 13, color: '#e53e3e' }}>Failed to load seat map</p>
                )}
              </div>
                )}

            {/* Reservations list */}
            {reservations.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <label className="form-label">Reserved seats ({reservations.length})</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                  {reservations.map((r) => (
                    <div key={r.cellId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', borderRadius: 6, background: '#ecfdf5', border: '1px solid #a7f3d0', fontSize: 13 }}>
                      <span>
                        <strong>{r.rowLabel}{r.seatNumber}</strong> &mdash; {r.holderName}
                      </span>
                      <button type="button" onClick={() => setReservations((prev) => prev.filter((x) => x.cellId !== r.cellId))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 14, fontWeight: 700 }}>&times;</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Category pricing */}
            {categoryPrices.length > 0 && (
              <>
                <div style={{ marginTop: 16 }}>
                  <label className="form-label">Category pricing</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
                    {categoryPrices.map((cp) => (
                      <div
                        key={cp.id}
                        style={{ display: 'flex', alignItems: 'center', gap: 12 }}
                      >
                        <span
                          style={{
                            width: 16, height: 16, borderRadius: 4,
                            backgroundColor: cp.color, flexShrink: 0, border: '1px solid #000',
                          }}
                        />
                        <span style={{ fontSize: 14, fontWeight: 500, minWidth: 100 }}>
                          {cp.name}
                        </span>
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>EGP</span>
                          <input
                            type="number"
                            min={0}
                            step={0.01}
                            placeholder="0.00"
                            value={cp.price}
                            onChange={(e) =>
                              setCategoryPrices((prev) =>
                                prev.map((p) => (p.id === cp.id ? { ...p, price: e.target.value } : p)),
                              )
                            }
                            className="form-input"
                            style={{ height: 38, marginLeft: 4 }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {fieldErrors.categoryPrices && <span style={{ display:'block', color:'#dc2626', fontSize:12, marginTop:4 }}>{fieldErrors.categoryPrices}</span>}
              </>
            )}

          </div>
        )}

        {/* Zone-based: zone builder */}
        {!isSeatBased && selectedVenue && (
          <div style={{ marginTop: 16 }}>
            <label className="form-label">Zones</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
              {zoneSections.map((z, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 120px 120px 40px', gap: 10, alignItems: 'end' }}>
                  <div>
                    {i === 0 && <label className="form-label" style={{ fontSize: 12 }}>Zone Name</label>}
                    <input type="text" className="form-input" placeholder="e.g. VIP" value={z.name} onChange={(e) => setZoneSections((prev) => prev.map((s, j) => j === i ? { ...s, name: e.target.value } : s))} style={{ height: 42 }} />
                  </div>
                  <div>
                    {i === 0 && <label className="form-label" style={{ fontSize: 12 }}>Price</label>}
                    <input type="number" min={0} className="form-input" placeholder="0" value={z.price} onChange={(e) => setZoneSections((prev) => prev.map((s, j) => j === i ? { ...s, price: e.target.value } : s))} style={{ height: 42 }} />
                  </div>
                  <div>
                    {i === 0 && <label className="form-label" style={{ fontSize: 12 }}>Capacity</label>}
                    <input type="number" min={0} className="form-input" placeholder="0" value={z.capacity} onChange={(e) => setZoneSections((prev) => prev.map((s, j) => j === i ? { ...s, capacity: e.target.value } : s))} style={{ height: 42 }} />
                  </div>
                  <button type="button" onClick={() => setZoneSections((prev) => prev.filter((_, j) => j !== i))} style={{ height: 42, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 18, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>&times;</button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setZoneSections((prev) => [...prev, { name: '', price: '', capacity: '' }])}
              style={{
                marginTop: 14, width: '100%', padding: '12px 0', borderRadius: 12,
                border: '2px dashed var(--border)', background: 'transparent',
                cursor: 'pointer', fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 600,
                color: 'var(--ink)', transition: 'border-color 150ms ease, background 150ms ease',
              }}
            >
              + Add Zone
            </button>
            {fieldErrors.zoneSections && <span style={{ display:'block', color:'#dc2626', fontSize:12, marginTop:8 }}>{fieldErrors.zoneSections}</span>}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Creating…' : 'Create Event'}
        </button>
      </div>

    </form>
    </>
  )
}
