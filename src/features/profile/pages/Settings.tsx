import { useState } from 'react'
import './Settings.css'

export default function Settings() {
  const [language, setLanguage] = useState('English')
  const [timezone, setTimezone] = useState('Africa/Cairo (UTC+2)')
  const [toggles, setToggles] = useState({ email: true, sms: false, push: true, marketing: false })
  const [twoFactor, setTwoFactor] = useState(false)

  return (
    <main className="wrap settings-page">
      <div className="page-head">
        <h1 className="section-title">Settings</h1>
        <p className="section-sub">Manage your account, security, and preferences</p>
      </div>
      <div className="settings-grid">
        <div className="card-white">
          <h2 className="card-title">Account Settings</h2>
          <div className="settings-list">
            <div className="setting-row">
              <div>
                <span className="mono-label">Email</span>
                <span className="setting-value">ahmed@example.com</span>
              </div>
              <a href="#" className="setting-link">Change</a>
            </div>
            <div className="setting-row">
              <div>
                <span className="mono-label">Language</span>
                <select className="form-select setting-select" value={language} onChange={(e) => setLanguage(e.target.value)}>
                  <option>English</option>
                  <option>Arabic</option>
                  <option>French</option>
                </select>
              </div>
            </div>
            <div className="setting-row">
              <div>
                <span className="mono-label">Timezone</span>
                <select className="form-select setting-select" value={timezone} onChange={(e) => setTimezone(e.target.value)}>
                  <option>Africa/Cairo (UTC+2)</option>
                  <option>Africa/Casablanca (UTC+1)</option>
                  <option>Europe/London (UTC+1)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        <div className="card-white">
          <h2 className="card-title">Notification Preferences</h2>
          <div className="settings-list">
            {[
              { key: 'email', label: 'Email notifications' },
              { key: 'sms', label: 'SMS notifications' },
              { key: 'push', label: 'Push notifications' },
              { key: 'marketing', label: 'Marketing emails' },
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
        <div className="card-white grid-span">
          <h2 className="card-title">Security</h2>
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
