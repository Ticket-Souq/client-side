import { useState } from 'react'
import { Link } from 'react-router-dom'
import './OrgSettings.css'

export default function OrgSettings() {
  const [language, setLanguage] = useState('English')
  const [timezone, setTimezone] = useState('Africa/Cairo UTC+2')
  const [toggles, setToggles] = useState({ bookings: true, cancellations: true, reports: true, marketing: false })
  const [twoFactor, setTwoFactor] = useState(true)

  return (
    <main className="wrap settings-org-page">
      <div className="page-head">
        <h1 className="section-title">Settings</h1>
        <p className="section-sub">Manage your account, organization, and preferences</p>
      </div>

      <div className="settings-grid">
        <div className="card-white">
          <h2 className="card-title">Account settings</h2>
          <div className="settings-list">
            <div className="setting-row">
              <div><span className="mono-label">Email</span><span className="setting-value">ahmed@cairoevents.com</span></div>
            </div>
            <div className="setting-row">
              <div><span className="mono-label">Name</span><span className="setting-value">Ahmed Khalil</span></div>
            </div>
            <div className="setting-row">
              <div><span className="mono-label">Language</span></div>
              <select className="form-select setting-select" value={language} onChange={(e) => setLanguage(e.target.value)}>
                <option>English</option>
                <option>Arabic</option>
              </select>
            </div>
            <div className="setting-row">
              <div><span className="mono-label">Timezone</span></div>
              <select className="form-select setting-select" value={timezone} onChange={(e) => setTimezone(e.target.value)}>
                <option>Africa/Cairo UTC+2</option>
                <option>UTC</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card-white">
          <h2 className="card-title">Organization settings</h2>
          <div className="settings-list">
            <div className="setting-row">
              <div><span className="mono-label">Organization name</span><span className="setting-value">Cairo Events Co.</span></div>
            </div>
            <div className="setting-row">
              <div><span className="mono-label">Organization type</span><span className="badge badge-soft">Event organizer</span></div>
            </div>
            <div className="setting-row">
              <Link to="/org/organization" className="btn btn-ghost btn-sm">Manage organization</Link>
            </div>
          </div>
        </div>

        <div className="card-white">
          <h2 className="card-title">Notification preferences</h2>
          <div className="settings-list">
            {[
              { key: 'bookings', label: 'New bookings', checked: toggles.bookings },
              { key: 'cancellations', label: 'Cancellations', checked: toggles.cancellations },
              { key: 'reports', label: 'Weekly reports', checked: toggles.reports },
              { key: 'marketing', label: 'Marketing', checked: toggles.marketing },
            ].map((t) => (
              <div key={t.key} className="setting-row">
                <span className="setting-value">{t.label}</span>
                <label
                  className={`toggle ${t.checked ? 'active' : ''}`}
                  onClick={() => setToggles({ ...toggles, [t.key]: !t.checked })}
                >
                  <span className="toggle-track"></span>
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="card-white">
          <h2 className="card-title">Security</h2>
          <div className="settings-list">
            <div className="setting-row">
              <div><span className="mono-label">Password</span><span className="setting-value">••••••••</span></div>
              <a href="/auth/change-password" className="btn btn-ghost btn-sm" style={{ border: '1px solid var(--border)' }}>Change password</a>
            </div>
            <div className="setting-row">
              <div>
                <span className="mono-label">Two-factor authentication</span>
                <span className="setting-value" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Add an extra layer of security</span>
              </div>
              <label
                className={`toggle ${twoFactor ? 'active' : ''}`}
                onClick={() => setTwoFactor(!twoFactor)}
              >
                <span className="toggle-track"></span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
