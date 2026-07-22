import './Profile.css'

export default function Profile() {
  return (
    <main className="wrap profile-org-page">
      <div className="page-head" style={{ padding: '37px 0 28px' }}>
        <div>
          <h1 className="section-title" style={{ margin: 0 }}>Profile</h1>
          <p className="section-sub" style={{ margin: '4px 0 0' }}>Manage your organizer account and organization</p>
        </div>
      </div>

      <div className="card-white profile-org-card">
        <div className="profile-org-top">
          <div className="profile-org-avatar">
            <div className="avatar avatar-lg">AK</div>
          </div>
          <div style={{ flex: 1 }}>
            <h2 className="profile-org-name">Ahmed Khalil</h2>
            <p className="profile-org-email">ahmed@cairoevents.com</p>
            <p className="profile-org-phone">+20 100 123 4567</p>
            <p className="profile-org-company">Cairo Events Co.</p>
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '24px 0' }} />

        <div className="meta-list">
          {[
            { label: 'Member since', value: 'Jan 2024' },
            { label: 'Account type', value: 'Organizer' },
          ].map((m, i) => (
            <div key={i} className="meta-row">
              <span className="mono-label">{m.label}</span>
              <span className="meta-value">{i === 1 ? <span className="badge badge-yellow">{m.value}</span> : m.value}</span>
            </div>
          ))}
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '24px 0' }} />

        <div className="profile-org-actions">
          <button className="btn btn-primary">Edit profile</button>
          <a href="/org/organization" className="btn btn-ghost" style={{ border: '1px solid var(--border)' }}>Manage Organization</a>
          <a href="/auth/change-password" className="btn btn-ghost" style={{ border: '1px solid var(--border)' }}>Change password</a>
        </div>
      </div>

      <div className="card-white danger-card">
        <h3 className="danger-title">Danger zone</h3>
        <p className="danger-text">Once you deactivate your account, you will lose access to all organizer features and your events will be unpublished. This action cannot be undone.</p>
        <button className="btn btn-danger">Deactivate account</button>
      </div>
    </main>
  )
}
