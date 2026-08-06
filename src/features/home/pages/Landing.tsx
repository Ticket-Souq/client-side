import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserProfileProvider } from '../../../shared/hooks/useUserProfile'
import { LayoutShell } from '../../../shared/components/layout/LayoutShell'
import { EventApi } from '../../events/services/eventApi'
import { API } from '../../../shared/api'
import type { EventCardResponse } from '../../events/types/event.types'
import { formatDate } from '../../../shared/format'
import { useFetch } from '../../../shared/hooks/useFetch'
import { EmptyState } from '../../../shared/components/display/StateViews/StateViews'
import { EventStatusRibbon } from '../../../shared/components/display/EventStatusRibbon/EventStatusRibbon'
import styles from '../styles/Landing.module.css'

function getNext7DaysBounds() {
  const now = new Date()
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  return { start, end }
}

function isInRange(dateStr: string, start: Date, end: Date) {
  const d = new Date(dateStr)
  return d >= start && d <= end
}

function formatMonth(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleString('en-US', { month: 'short' }).toUpperCase()
}

function imgSrc(url: string | null | undefined) {
  return url ? `${API.base}${url}` : ''
}

const ART_CLASSES = [styles.artBeams, styles.artWaves, styles.artGrid, styles.artConfetti]

function artClass(i: number) { return ART_CLASSES[i % ART_CLASSES.length] }

export default function Landing() {
  const navigate = useNavigate()
  const [heroSlide, setHeroSlide] = useState(0)
  const { data, loading } = useFetch<EventCardResponse[]>(async () => (await EventApi.list(0, 50)).content, '')
  const events = data ?? []

  const { heroEvents, categoryMap } = useMemo(() => {
    const { start, end } = getNext7DaysBounds()
    const published = events.filter((ev) => ev.status === 'PUBLISHED')
    const inWindow: EventCardResponse[] = []
    const rest: EventCardResponse[] = []
    for (const ev of published) {
      if (isInRange(ev.startDate, start, end)) {
        inWindow.push(ev)
      } else {
        rest.push(ev)
      }
    }
    inWindow.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    rest.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    const hero = inWindow.length > 0 ? inWindow : rest.slice(0, 6)
    const map = new Map<string, EventCardResponse[]>()
    for (const ev of events) {
      const cat = ev.categoryName || 'General'
      if (!map.has(cat)) map.set(cat, [])
      map.get(cat)!.push(ev)
    }
    return { heroEvents: hero, categoryMap: map }
  }, [events])

  useEffect(() => {
    if (heroEvents.length > 0 && heroSlide >= heroEvents.length) setHeroSlide(0)
  }, [heroEvents.length, heroSlide])

  useEffect(() => {
    if (heroEvents.length < 2) return
    const id = setInterval(() => setHeroSlide((s) => (s + 1) % heroEvents.length), 5000)
    return () => clearInterval(id)
  }, [heroEvents.length])

  return (
    <UserProfileProvider>
      <LayoutShell>
        <main className={styles.wrap}>
        {loading ? null : heroEvents.length > 0 && (
        <section className={styles.heroSection}>
          <p className={styles.heroEyebrow}>Events in the next 7 days</p>
          <div style={{ position: 'relative' }}>
            <div className={styles.tapeWrap}>
              <div className={styles.tapeTrack} style={{ transform: `translateX(-${heroSlide * 100}%)` }}>
                {heroEvents.map((event) => (
                  <div key={event.id} className={styles.tapeSlide}>
                    <div className={styles.ticketCard} style={{ cursor: 'pointer' }} onClick={() => navigate(`/events/${event.id}`)}>
                      <EventStatusRibbon status={event.status} />
                      <div className={styles.ticketArt} style={event.bannerUrl ? { background: 'none' } : {}}>
                        {event.bannerUrl ? (
                          <img
                            src={imgSrc(event.bannerUrl)}
                            alt={event.title}
                            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : null}
                        {!event.bannerUrl && (
                          <>
                            <div className={styles.beam} style={{ position: 'absolute', width: 2, top: 0, bottom: 0, background: 'linear-gradient(color-mix(in srgb, var(--yellow) 50%, transparent), transparent)' }} />
                            <div className={styles.beam} style={{ position: 'absolute', width: 2, top: 0, bottom: 0, background: 'linear-gradient(color-mix(in srgb, var(--yellow) 50%, transparent), transparent)', left: '22%' }} />
                            <div className={styles.beam} style={{ position: 'absolute', width: 2, top: 0, bottom: 0, background: 'linear-gradient(color-mix(in srgb, var(--yellow) 50%, transparent), transparent)', left: '58%' }} />
                            <div className={styles.beam} style={{ position: 'absolute', width: 2, top: 0, bottom: 0, background: 'linear-gradient(color-mix(in srgb, var(--yellow) 50%, transparent), transparent)', left: '81%' }} />
                          </>
                        )}
                        <div className={styles.ticketMainContent}>
                          <span className={styles.ticketTag}>{event.categoryName || event.category || 'Event'}</span>
                          <h1 className={styles.ticketTitle}>{event.title}</h1>
                          <div className={styles.ticketMeta}>
                            <span>{formatDate(event.startDate)}</span>
                            <span>{event.location || event.venueName || 'TBD'}</span>
                          </div>
                        </div>
                      </div>
                      <div className={styles.ticketStub}>
                        <span className={`${styles.stubNotch} ${styles.stubNotchTop}`} />
                        <div className={styles.stubRow}>
                          <span className={styles.stubLabel}>Category</span>
                          <span className={styles.stubValue}>{event.categoryName || event.category || 'General'}</span>
                        </div>
                        <div className={styles.stubRow}>
                          <span className={styles.stubLabel}>Location</span>
                          <span className={styles.stubValue}>{event.location || event.venueName || 'TBD'}</span>
                        </div>
                        <button className={`${styles.btn} ${styles.btnPrimary} ${styles.stubCta}`}>View Details</button>
                        <span className={`${styles.stubNotch} ${styles.stubNotchBottom}`} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {heroEvents.length > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
              {heroEvents.map((_, i) => (
                <button key={i} onClick={() => setHeroSlide(i)}
                  style={{ width: 10, height: 10, borderRadius: '50%', border: 'none', background: i === heroSlide ? 'var(--yellow)' : 'var(--border)', cursor: 'pointer', padding: 0, transition: 'background 0.25s, transform 0.25s', transform: i === heroSlide ? 'scale(1.4)' : 'scale(1)' }}
                  aria-label={`Go to slide ${i + 1}`} />
              ))}
            </div>
          )}
        </section>
        )}

        {!loading && [...categoryMap.entries()].map(([catName, catEvents]) => (
          <section key={catName} className={styles.rowSection}>
            <div className={styles.rowHead}>
              <h2 className={styles.rowTitle}>{catName}</h2>
            </div>
            <div className={styles.hscroll}>
              {catEvents.map((event) => (
                <div key={event.id} className={styles.ecard} style={{ cursor: 'pointer' }} onClick={() => navigate(`/events/${event.id}`)}>
                  {event.posterUrl ? (
                    <img src={imgSrc(event.posterUrl)} alt={event.title}
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div className={`${styles.art} ${artClass(catEvents.indexOf(event))}`} />
                  )}
                  <EventStatusRibbon status={event.status} />
                  <span className={styles.corner}>{formatMonth(event.startDate)}</span>
                  <div className={styles.overlay}>
                    <p className={styles.evTitle}>{event.title}</p>
                    <p className={styles.evMeta}>{formatDate(event.startDate)} · {event.location || event.venueName || 'TBD'}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        {!loading && heroEvents.length === 0 && categoryMap.size === 0 && (
          <section className={styles.heroSection}>
            <EmptyState message="No events available yet." style={{ fontSize: 14 }} />
          </section>
        )}
      </main>
      </LayoutShell>
    </UserProfileProvider>
  )
}
