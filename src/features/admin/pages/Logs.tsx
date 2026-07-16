import { useState } from "react";

interface AuditLog {
  id: string;
  action: string;
  madeBy: string;
  reason: string;
  madeAt: string;
}

const MOCK_LOGS: AuditLog[] = [
  { id: "log-1", action: "USER_BANNED", madeBy: "admin@ticketsouq.com", reason: "Policy violation", madeAt: "2026-07-15T10:30:00" },
  { id: "log-2", action: "ORG_APPROVED", madeBy: "admin@ticketsouq.com", reason: "Documents verified", madeAt: "2026-07-14T14:15:00" },
  { id: "log-3", action: "EVENT_CANCELLED", madeBy: "org-head@example.com", reason: "Venue unavailable", madeAt: "2026-07-13T09:00:00" },
];

export default function Logs() {
  const [logs] = useState(MOCK_LOGS);

  return (
    <div className="container py-5">
      <h2 className="fw-bold mb-4" style={{ fontFamily: "var(--font-display)" }}>Audit Logs</h2>
      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table mb-0 align-middle" style={{ fontSize: "14px" }}>
            <thead>
              <tr>
                <th className="ps-4">Action</th>
                <th>Made By</th>
                <th>Reason</th>
                <th className="pe-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="ps-4">
                    <span className="badge px-2 py-1" style={{ backgroundColor: "var(--color-accent)", color: "var(--color-text)", fontWeight: 600, fontSize: "11px", borderRadius: "4px" }}>
                      {log.action}
                    </span>
                  </td>
                  <td>{log.madeBy}</td>
                  <td style={{ color: "var(--color-text-secondary)" }}>{log.reason}</td>
                  <td className="pe-4" style={{ color: "var(--color-text-secondary)" }}>
                    {new Date(log.madeAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
