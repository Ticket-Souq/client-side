import { useState } from 'react'
import './AdminSettings.css'

export default function AdminSettings() {
  const [language, setLanguage] = useState('English')
  const [timezone, setTimezone] = useState('UTC+2 (Cairo)')
  const [defaultLang, setDefaultLang] = useState('English')
  const [maintenance, setMaintenance] = useState(false)
  const [allowRegistrations, setAllowRegistrations] = useState(true)
  const [twoFactor, setTwoFactor] = useState(true)
  const [toggles, setToggles] = useState({
    orgRequests: true,
    systemAlerts: true,
    errorReports: true,
    weeklySummary: true,
  })

  return (
    <main className="wrap settings-admin-page">
      <div className="page-head">
        <h1 className="section-title">Admin Settings</h1>
        <p className="section-sub">Manage platform configuration and preferences</p>
      </div>
      <div className="settings-grid">
        <div className="card-white">
          <h2 className="card-title">Account Settings</h2>
          <div className="settings-list">
            <div className="setting-row">
              <div>
                <span className="mono-label">Email</span>
                <span className="setting-value">admin@ticketsmarche.com</span>
              </div>
              <a href="#" className="setting-link">Change</a>
            </div>
            <div className="setting-row">
              <div>
                <span className="mono-label">Name</span>
                <span className="setting-value">Admin User</span>
              </div>
              <a href="#" className="setting-link">Change</a>
            </div>
            <div className="setting-row">
              <div>
                <span className="mono-label">Language</span>
                <select className="form-select setting-select" value={language} onChange={(e) => setLanguage(e.target.value)}>
                  <option>English</option>
                  <option>Arabic</option>
                </select>
              </div>
            </div>
            <div className="setting-row">
              <div>
                <span className="mono-label">Timezone</span>
                <select className="form-select setting-select" value={timezone} onChange={(e) => setTimezone(e.target.value)}>
                  <option>UTC+2 (Cairo)</option>
                  <option>UTC+3</option>
                  <option>UTC+0</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        <div className="card-white">
          <h2 className="card-title">Security Settings</h2>
          <div className="settings-list">
            <div className="setting-row">
              <div>
                <span className="mono-label">Password</span>
                <span className="setting-value">&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;</span>
              </div>
              <a href="/auth/change-password" className="btn btn-ghost btn-sm">Change password</a>
            </div>
            <div className="setting-row">
              <div>
                <span className="mono-label">Two-factor authentication</span>
                <span className="setting-value hint">Protect your account with an extra layer of security</span>
              </div>
              <label
                className={`toggle ${twoFactor ? 'active' : ''}`}
                onClick={() => setTwoFactor(!twoFactor)}
              >
                <span className="toggle-track"></span>
              </label>
            </div>
            <div className="setting-row section-label">
              <span className="mono-label">Active sessions</span>
            </div>
            <div className="session-row">
              <div className="session-info">
                <span className="session-device">Current browser</span>
                <span className="session-meta">Chrome on macOS &middot; 192.168.1.10</span>
              </div>
              <span className="session-active">Active now</span>
              <a href="#" className="setting-link revoke">Revoke</a>
            </div>
            <div className="session-row">
              <div className="session-info">
                <span className="session-device">Mobile app</span>
                <span className="session-meta">Ticket Souq iOS &middot; 10.0.2.15</span>
              </div>
              <span className="session-last">Last active 2h ago</span>
              <a href="#" className="setting-link revoke">Revoke</a>
            </div>
            <div className="session-row session-row-last">
              <div className="session-info">
                <span className="session-device">Tablet</span>
                <span className="session-meta">Ticket Souq Android &middot; 172.16.0.5</span>
              </div>
              <span className="session-last">Last active 1d ago</span>
              <a href="#" className="setting-link revoke">Revoke</a>
            </div>
          </div>
        </div>
        <div className="card-white">
          <h2 className="card-title">System Settings</h2>
          <div className="settings-list">
            <div className="setting-row">
              <div>
                <span className="mono-label">Default language</span>
                <select className="form-select setting-select" value={defaultLang} onChange={(e) => setDefaultLang(e.target.value)}>
                  <option>English</option>
                  <option>Arabic</option>
                </select>
              </div>
            </div>
            <div className="setting-row">
              <div>
                <span className="mono-label">Maintenance mode</span>
                <span className="setting-value hint">Prevent user access during maintenance</span>
              </div>
              <label
                className={`toggle ${maintenance ? 'active' : ''}`}
                onClick={() => setMaintenance(!maintenance)}
              >
                <span className="toggle-track"></span>
              </label>
            </div>
            <div className="setting-row">
              <div>
                <span className="mono-label">Allow new registrations</span>
                <span className="setting-value hint">New users can sign up on the platform</span>
              </div>
              <label
                className={`toggle ${allowRegistrations ? 'active' : ''}`}
                onClick={() => setAllowRegistrations(!allowRegistrations)}
              >
                <span className="toggle-track"></span>
              </label>
            </div>
            <div className="setting-row section-label">
              <span className="mono-label">Related pages</span>
            </div>
            <div className="setting-row">
              <a href="/admin/monitoring" className="setting-link">System Monitoring</a>
            </div>
            <div className="setting-row">
              <a href="/admin/logs" className="setting-link">Audit Logs</a>
            </div>
          </div>
        </div>
        <div className="card-white">
          <h2 className="card-title">Notification Preferences</h2>
          <div className="settings-list">
            {[
              { key: 'orgRequests', label: 'New organization requests' },
              { key: 'systemAlerts', label: 'System alerts' },
              { key: 'errorReports', label: 'Error reports' },
              { key: 'weeklySummary', label: 'Weekly summary' },
            ].map((t) => (
              <div key={t.key} className="setting-row">
                <span className="setting-value">{t.label}</span>
                <label
                  className={`toggle ${toggles[t.key as keyof typeof toggles] ? 'active' : ''}`}
                  onClick={() => setToggles({ ...toggles, [t.key]: !toggles[t.key as keyof typeof toggles] })}
                >
                  <span className="toggle-track"></span>
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
