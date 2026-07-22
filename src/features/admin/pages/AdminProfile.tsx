import './AdminProfile.css'

export default function AdminProfile() {
  return (
    <main className="wrap profile-admin-page">
      <div className="page-head">
        <h1 className="section-title">Admin Profile</h1>
        <p className="section-sub">Your admin account overview</p>
      </div>
      <div className="card-white admin-profile-card">
        <div className="profile-header">
          <div className="avatar avatar-lg">AD</div>
          <div className="profile-details">
            <h2 className="profile-name">Admin User</h2>
            <p className="profile-email">admin@ticketsmarche.com</p>
            <p><span className="badge badge-yellow">Platform Administrator</span></p>
            <p className="profile-member">Member since Jan 2023</p>
          </div>
        </div>
        <hr className="divider" />
        <div className="profile-links">
          <a href="/admin/settings" className="btn btn-ghost">System Settings</a>
          <a href="/admin/logs" className="btn btn-ghost">View Audit Logs</a>
          <a href="/auth/change-password" className="btn btn-ghost">Change password</a>
        </div>
      </div>
    </main>
  )
}
