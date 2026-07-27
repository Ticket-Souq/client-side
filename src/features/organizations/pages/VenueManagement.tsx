import { useState } from 'react'
import './VenueManagement.css'

const VENUES = [
  { name: 'Cairo Arena', location: 'Nasr City, Cairo', capacity: '250', status: 'Active' },
  { name: 'Nile Theatre', location: 'Zamalek, Cairo', capacity: '800', status: 'Active' },
  { name: 'Zamalek Hall', location: 'Zamalek, Cairo', capacity: '120', status: 'Inactive' },
  { name: 'Maadi Stadium', location: 'Maadi, Cairo', capacity: '2K', status: 'Inactive' },
  { name: 'Giza Convention', location: 'Giza', capacity: '500', status: 'Active' },
  { name: 'New Capital Expo', location: 'New Cairo', capacity: '3K', status: 'Active' },
]

export default function VenueManagement() {
  return (
    <main className="wrap">
      <div className="page-head">
        <h1 className="section-title" style={{ margin: 0 }}>Venues</h1>
        <button className="btn btn-primary">Create venue</button>
      </div>

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
              {VENUES.map((v, i) => (
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
