import { useState } from "react";

interface PendingOrg {
  id: string;
  name: string;
  email: string;
  submittedAt: string;
}

const MOCK_PENDING: PendingOrg[] = [
  { id: "pend-1", name: "New Stage Productions", email: "hello@newstage.com", submittedAt: "2026-07-12T08:00:00" },
  { id: "pend-2", name: "Eventify Ltd", email: "contact@eventify.io", submittedAt: "2026-07-14T16:30:00" },
];

export default function OrganizationApproval() {
  const [pending, setPending] = useState(MOCK_PENDING);

  const handleApprove = (id: string) => setPending((prev) => prev.filter((o) => o.id !== id));
  const handleReject = (id: string) => setPending((prev) => prev.filter((o) => o.id !== id));

  return (
    <div className="container py-5">
      <h2 className="fw-bold mb-4" style={{ fontFamily: "var(--font-display)" }}>Organization Approve Requests</h2>
      {pending.length === 0 ? (
        <p style={{ color: "var(--color-text-secondary)" }}>No pending requests.</p>
      ) : (
        <div className="d-flex flex-column gap-3">
          {pending.map((org) => (
            <div key={org.id} className="card border-0 shadow-sm p-4">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h6 className="fw-semibold mb-1" style={{ fontSize: "15px" }}>{org.name}</h6>
                  <span style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>{org.email}</span>
                  <div style={{ fontSize: "12px", color: "var(--color-text-secondary)", marginTop: "4px" }}>
                    Submitted {new Date(org.submittedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                  </div>
                </div>
                <div className="d-flex gap-2">
                  <button
                    onClick={() => handleApprove(org.id)}
                    className="btn btn-sm fw-semibold px-3 border-0"
                    style={{ backgroundColor: "#DCFCE7", color: "#16A34A", fontSize: "12px", borderRadius: "4px" }}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(org.id)}
                    className="btn btn-sm fw-semibold px-3 border-0"
                    style={{ backgroundColor: "#FEE2E2", color: "#DC2626", fontSize: "12px", borderRadius: "4px" }}
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
  );
}
