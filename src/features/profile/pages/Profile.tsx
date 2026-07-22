import './Profile.css'

export default function Profile() {
  return (
    <main className="wrap profile-page">
      <div className="page-head">
        <h1 className="section-title">Profile</h1>
        <p className="section-sub">Manage your personal information and account</p>
      </div>
      <div className="card-white">
        <div className="profile-card">
          <div className="avatar avatar-lg">AN</div>
          <div className="profile-card-main">
            <h2 className="profile-name">Ahmed Nour</h2>
            <p className="profile-detail"><strong>Email</strong> ahmed@example.com</p>
            <p className="profile-detail"><strong>Phone</strong> +20 100 123 4567</p>
            <p className="profile-detail"><strong>Location</strong> Cairo, Egypt</p>
            <div className="profile-meta">
              <span>Member since Jan 2026</span>
              <span className="badge badge-yellow">Customer</span>
            </div>
            <div className="profile-actions">
              <button className="btn btn-ghost" style={{ border: '1px solid var(--border)' }}>Edit profile</button>
              <a href="/auth/change-password" className="setting-link" style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-soft)' }}>Change password</a>
            </div>
          </div>
        </div>
      </div>
      <div className="card-white danger-card">
        <h2 className="danger-title">Deactivate account</h2>
        <p className="danger-text">Once you deactivate your account, your profile, tickets, and event history will be hidden. You can reactivate at any time by logging back in.</p>
        <button className="btn btn-danger btn-sm">Deactivate account</button>
      </div>
    </main>
  )
}
