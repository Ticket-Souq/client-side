import { useState } from 'react'
import './Outlets.css'

interface Outlet {
  name: string
  location: string
  hours: string
}

const CITIES = ['All cities', 'Cairo', 'Alexandria', 'Giza', 'Sharm El Sheikh']

const OUTLETS: Record<string, Outlet[]> = {
  Cairo: [
    { name: 'City Stars Mall', location: 'Nasr City, Cairo', hours: 'Daily: 10:00 AM – 11:00 PM' },
    { name: 'Cairo Festival City', location: 'New Cairo, Cairo', hours: 'Daily: 10:00 AM – 12:00 AM' },
    { name: 'Downtown Katameya', location: 'Katameya, New Cairo', hours: 'Daily: 10:00 AM – 11:00 PM' },
    { name: 'Mall of Egypt', location: '6th of October, Giza', hours: 'Daily: 10:00 AM – 12:00 AM' },
  ],
  Alexandria: [
    { name: 'San Stefano Mall', location: 'Roushdy, Alexandria', hours: 'Daily: 10:00 AM – 11:00 PM' },
    { name: 'City Centre Alexandria', location: 'Smouha, Alexandria', hours: 'Daily: 10:00 AM – 12:00 AM' },
  ],
  'Sharm El Sheikh': [
    { name: 'IL Mercato', location: 'Naama Bay, Sharm El Sheikh', hours: 'Daily: 9:00 AM – 11:00 PM' },
  ],
}

export default function Outlets() {
  const [search, setSearch] = useState('')
  const [city, setCity] = useState('All cities')

  const filtered = Object.entries(OUTLETS)
    .filter(([c]) => city === 'All cities' || c === city)
    .map(([c, outlets]) => [
      c,
      outlets.filter((o) => o.name.toLowerCase().includes(search.toLowerCase()) || o.location.toLowerCase().includes(search.toLowerCase())),
    ] as const)
    .filter(([, outlets]) => outlets.length > 0)

  return (
    <main className="wrap outlets-page">
      <section className="page-head">
        <h1 className="section-title">Ticket Outlets</h1>
        <p className="section-sub">Find physical locations across Egypt to purchase tickets in person</p>
      </section>

      <div className="filter-bar" style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
        <input className="form-input" type="search" placeholder="Search outlets by name or location…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ flex: 1 }} />
        <select className="form-select" value={city} onChange={(e) => setCity(e.target.value)} style={{ width: 'auto', minWidth: 180 }}>
          {CITIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      {filtered.map(([cityName, outlets]) => (
        <section key={cityName} className="row-section" style={{ marginBottom: 36 }}>
          <div className="row-head" style={{ marginBottom: 18 }}>
            <h2 className="row-title" style={{ fontSize: 22, fontWeight: 600 }}>{cityName}</h2>
          </div>
          <div className="outlet-grid">
            {outlets.map((o) => (
              <div key={o.name} className="outlet-card">
                <div className="outlet-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="1.5">
                    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                </div>
                <h3 className="outlet-name">{o.name}</h3>
                <p className="outlet-location">{o.location}</p>
                <p className="outlet-hours">{o.hours}</p>
                <span className="badge badge-ink mono">Open Now</span>
              </div>
            ))}
          </div>
        </section>
      ))}
    </main>
  )
}
