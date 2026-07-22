import './Profile.css'

export default function Profile() {
  return (
    <main className="wrap profile-org-page">
      <div className="page-head">
        <h1 className="section-title">Profile</h1>
        <p className="section-sub">Manage your organizer account and organization</p>
      </div>

      <div className="card-white profile-org-card">
        <div className="profile-org-top">
          <div className="profile-org-avatar">
            <div className="avatar avatar-lg">AK</div>
          </div>
          <div className="profile-org-details">
            <h2 className="profile-org-name">Ahmed Khalil</h2>
            <p className="profile-org-email">ahmed@cairoevents.com</p>
            <p className="profile-org-phone">+20 100 987 6543</p>
            <p className="profile-org-company">Cairo Events Co.</p>
          </div>
        </div>

        <hr className="divider" />

        <div className="meta-list">
          <div className="meta-row">
            <span className="mono-label">Member since</span>
            <span className="meta-value">Jan 2024</span>
          </div>
          <div className="meta-row">
            <span className="mono-label">Account type</span>
            <span className="meta-value"><span className="badge badge-ink">Organizer</span></span>
          </div>
        </div>

        <hr className="divider" />

        <div className="profile-org-actions">
          <button className="btn btn-ghost">Edit profile</button>
          <a href="/org/organization" className="btn btn-ghost">Manage Organization</a>
          <a href="/auth/change-password" className="btn btn-ghost">Change password</a>
        </div>
      </div>

      <div className="card-white danger-card">
        <div className="card-header">
          <h2 className="danger-title">Danger zone</h2>
        </div>
        <p className="danger-text">Deactivate your organizer account. Your events, venues, and organization data will no longer be visible.</p>
        <button className="btn btn-danger btn-sm">Deactivate account</button>
      </div>
    </main>
  )
}
