import { useState } from 'react'
import { Link } from 'react-router-dom'
import './OrgManagement.css'

interface Member {
  initials: string
  name: string
  email: string
  role: string
  roleBadge: string
  status: string
  statusBadge: string
  showRemove: boolean
}

const MEMBERS: Member[] = [
  { initials: 'AK', name: 'Ahmed Khaled', email: 'ahmed@cairoevents.com', role: 'Organization Head', roleBadge: 'badge-yellow', status: 'Active', statusBadge: 'badge-green', showRemove: false },
  { initials: 'SM', name: 'Sara Mahmoud', email: 'sara@cairoevents.com', role: 'Agent', roleBadge: 'badge-ink', status: 'Active', statusBadge: 'badge-green', showRemove: true },
  { initials: 'MH', name: 'Mohamed Hassan', email: 'mohamed@cairoevents.com', role: 'Agent', roleBadge: 'badge-ink', status: 'Active', statusBadge: 'badge-green', showRemove: true },
  { initials: 'NA', name: 'Nour Ali', email: 'nour@cairoevents.com', role: 'Consumer', roleBadge: 'badge-soft', status: 'Active', statusBadge: 'badge-green', showRemove: true },
  { initials: 'LY', name: 'Layla Youssef', email: 'layla@cairoevents.com', role: 'Consumer', roleBadge: 'badge-soft', status: 'Pending', statusBadge: 'badge-yellow', showRemove: true },
]

export default function OrgManagement() {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', role: '' })

  return (
    <main className="wrap org-page">
      <section style={{ marginBottom: 28 }}>
        <div className="summary-card org-hero">
          <h1 className="summary-title">Cairo Events Co.</h1>
          <p className="summary-sub">Organization since 2019</p>
          <div style={{ marginTop: 8 }}>
            <span className="badge badge-yellow">ACTIVE</span>
            <span className="badge badge-soft">ORGANIZER</span>
          </div>
          <p className="contact-line"><span>contact@cairoevents.com</span><span>+20 100 555 1234</span></p>
        </div>
      </section>

      <div className="card-white">
        <h2 className="section-title" style={{ marginBottom: 16 }}>Organization Details</h2>
        <div className="grid-2">
          <div>
            <div className="detail-row">
              <span className="detail-label">Registration #</span>
              <span className="detail-value mono">REG-2019-0847</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Tax ID</span>
              <span className="detail-value mono">TAX-452-1903-7</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Address</span>
              <span className="detail-value">12 Tahrir St, Downtown, Cairo</span>
            </div>
          </div>
          <div>
            <div className="detail-row">
              <span className="detail-label">Website</span>
              <span className="detail-value">cairoevents.com</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Founded</span>
              <span className="detail-value">March 2019</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Members</span>
              <span className="detail-value">18</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card-white">
        <div className="section-row">
          <h2 className="section-title">Members</h2>
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>Add member</button>
        </div>

        <div id="add-member-form" className={`add-member-form ${showForm ? 'open' : ''}`}>
          <div className="form-row">
            <input className="form-input" type="text" placeholder="Full name" style={{ flex: 2 }} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className="form-input" type="email" placeholder="Email" style={{ flex: 2 }} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <select className="form-select" style={{ flex: 1.5 }} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="">Select role</option>
              <option>Consumer</option>
              <option>Agent</option>
              <option>Organization Head</option>
            </select>
            <button className="btn btn-primary btn-sm">Invite</button>
          </div>
        </div>

        <div className="table-scroll">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {MEMBERS.map((m, i) => (
                <tr key={i}>
                  <td>
                    <div className="cell-with-avatar">
                      <div className="avatar avatar-sm">{m.initials}</div>
                      <span>{m.name}</span>
                    </div>
                  </td>
                  <td className="mono">{m.email}</td>
                  <td><span className={`badge ${m.roleBadge}`}>{m.role}</span></td>
                  <td><span className={`badge ${m.statusBadge}`}>{m.status}</span></td>
                  <td className="actions-cell">
                    {m.showRemove ? <a href="#" className="action-link action-remove">Remove</a> : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ marginTop: 12, textAlign: 'right' }}>
        <Link to="/org/team" className="btn btn-ghost btn-sm">Manage all members →</Link>
      </div>

      <div className="card-white">
        <h2 className="section-title" style={{ marginBottom: 16 }}>Organization Status</h2>
        <div className="status-block">
          <span className="status-label">Current Status</span>
          <span className="badge badge-yellow">ACTIVE</span>
        </div>
        <div className="status-block">
          <span className="status-label">Verification</span>
          <span className="badge badge-green">VERIFIED</span>
        </div>
        <hr className="divider" />
        <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 8px' }}>Generate Employee Accounts</h3>
        <p className="gen-accounts-desc">Create credentials for your staff members so they can manage events, process tickets, and access organization-level reports. Each account will receive a unique username and a temporary password.</p>
        <a href="#" className="btn btn-primary">Generate accounts</a>
      </div>

      <div className="card-white">
        <h2 className="section-title" style={{ marginBottom: 4 }}>Quick Stats</h2>
        <div className="grid-3">
          <div className="stat-box">
            <p className="stat-number">24</p>
            <p className="stat-label">Total Events</p>
          </div>
          <div className="stat-box">
            <p className="stat-number">18</p>
            <p className="stat-label">Active Members</p>
          </div>
          <div className="stat-box">
            <p className="stat-number">EGP 142K</p>
            <p className="stat-label">Revenue</p>
          </div>
        </div>
      </div>
    </main>
  )
}
