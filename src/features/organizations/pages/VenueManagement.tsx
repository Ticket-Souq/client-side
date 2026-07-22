import { useState } from 'react'
import './VenueManagement.css'

const VENUES = [
  { name: 'Cairo Arena', location: 'Nasr City, Cairo', capacity: '250', status: 'Active', art: 'art-beams' },
  { name: 'Nile Theatre', location: 'Zamalek, Cairo', capacity: '800', status: 'Active', art: 'art-waves' },
  { name: 'Zamalek Hall', location: 'Zamalek, Cairo', capacity: '120', status: 'Inactive', art: 'art-grid' },
  { name: 'Maadi Stadium', location: 'Maadi, Cairo', capacity: '2K', status: 'Inactive', art: 'art-confetti' },
  { name: 'Giza Convention', location: 'Giza', capacity: '500', status: 'Active', art: 'art-waves' },
  { name: 'New Capital Expo', location: 'New Cairo', capacity: '3K', status: 'Active', art: 'art-beams' },
]

export default function VenueManagement() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All')
  const [capacity, setCapacity] = useState('Any capacity')

  const filtered = VENUES.filter((v) => {
    const matchSearch = v.name.toLowerCase().includes(search.toLowerCase()) || v.location.toLowerCase().includes(search.toLowerCase())
    const matchStatus = status === 'All' || v.status === status
    const matchCap = capacity === 'Any capacity'
      || (capacity === '<100' && parseInt(v.capacity) < 100)
      || (capacity === '100-500' && parseInt(v.capacity) >= 100 && parseInt(v.capacity) <= 500)
      || (capacity === '500+' && parseInt(v.capacity) >= 500)
      || (capacity === '500+' && v.capacity.includes('K'))
    return matchSearch && matchStatus && matchCap
  })

  return (
    <main className="wrap">
      <div className="page-head">
        <h1 className="section-title" style={{ margin: 0 }}>Venues</h1>
        <button className="btn btn-primary">Create venue</button>
      </div>

      <div className="filter-bar" style={{ marginBottom: 28 }}>
        <input className="form-input" type="search" placeholder="Search venues…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option>All</option>
          <option>Active</option>
          <option>Inactive</option>
        </select>
        <select className="form-select" value={capacity} onChange={(e) => setCapacity(e.target.value)}>
          <option>Any capacity</option>
          <option>{'<100'}</option>
          <option>100-500</option>
          <option>500+</option>
        </select>
      </div>

      <section className="row-section" style={{ paddingTop: 0 }}>
        <div className="hscroll">
          {VENUES.map((v, i) => (
            <div key={i} className="ecard">
              <div className={`art ${v.art}`} style={{ height: 120 }} />
              <span className="corner" style={{ fontSize: 12 }}>{v.capacity}</span>
              <div className="overlay">
                <p className="ev-title">{v.name}</p>
                <div className="venue-meta">
                  <span className="ev-meta">{v.location}</span>
                  <span className={`badge ${v.status === 'Active' ? 'badge-green' : 'badge-orange'}`} style={{ fontSize: 10, padding: '4px 10px', height: 'auto' }}>{v.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="card-white">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Location</th>
                <th>Capacity</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((v, i) => (
                <tr key={i}>
                  <td><strong>{v.name}</strong></td>
                  <td>{v.location}</td>
                  <td>{v.capacity}</td>
                  <td><span className={`badge ${v.status === 'Active' ? 'badge-green' : 'badge-orange'}`}>{v.status}</span></td>
                  <td><div className="table-actions"><a href="#" className="action-link">Edit</a><a href="#" className="action-link" style={{ color: '#d32f2f' }}>Delete</a></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
