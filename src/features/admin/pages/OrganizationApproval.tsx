import { useState } from 'react'

interface PendingOrg {
  id: string
  name: string
  email: string
  submittedAt: string
}

const MOCK_PENDING: PendingOrg[] = [
  { id: 'pend-1', name: 'New Stage Productions', email: 'hello@newstage.com', submittedAt: '2026-07-12T08:00:00' },
  { id: 'pend-2', name: 'Eventify Ltd', email: 'contact@eventify.io', submittedAt: '2026-07-14T16:30:00' },
  { id: 'pend-3', name: 'Cairo Arts Collective', email: 'info@cairoarts.org', submittedAt: '2026-07-16T09:15:00' },
]

export default function OrganizationApproval() {
  const [pending, setPending] = useState(MOCK_PENDING)

  const handleApprove = (id: string) => setPending((prev) => prev.filter((o) => o.id !== id))
  const handleReject = (id: string) => setPending((prev) => prev.filter((o) => o.id !== id))

  return (
    <div className="wrap" style={{ padding: '36px 0' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 className="section-title" style={{ margin: 0 }}>Organization Approval</h1>
        <p className="section-sub" style={{ margin: '4px 0 0' }}>
          Review and approve pending organization registration requests.
        </p>
      </div>

      {pending.length === 0 ? (
        <div className="card-white" style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
          No pending requests.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {pending.map((org) => (
            <div key={org.id} className="card-white" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 4px' }}>{org.name}</h3>
                  <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{org.email}</span>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                    Submitted {new Date(org.submittedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => handleApprove(org.id)}
                    className="btn btn-primary btn-sm"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(org.id)}
                    className="btn btn-danger btn-sm"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
