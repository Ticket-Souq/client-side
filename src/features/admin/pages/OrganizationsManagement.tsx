import { useState } from "react";

interface OrgRow {
  id: string;
  name: string;
  email: string;
  status: "ACTIVE" | "BANNED";
}

const MOCK_ORGS: OrgRow[] = [
  { id: "org-1", name: "Grand Events Co.", email: "contact@grandevents.com", status: "ACTIVE" },
  { id: "org-2", name: "Stage Masters", email: "info@stagemasters.com", status: "ACTIVE" },
  { id: "org-3", name: "Fake Tickets Inc.", email: "admin@faketicks.com", status: "BANNED" },
];

export default function OrganizationsManagement() {
  const [orgs, setOrgs] = useState(MOCK_ORGS);

  const toggleBan = (id: string) => {
    setOrgs((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: o.status === "ACTIVE" ? "BANNED" as const : "ACTIVE" as const } : o))
    );
  };

  return (
    <div className="container py-5">
      <h2 className="fw-bold mb-4" style={{ fontFamily: "var(--font-display)" }}>Organizations</h2>
      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table mb-0 align-middle" style={{ fontSize: "14px" }}>
            <thead>
              <tr>
                <th className="ps-4">Name</th>
                <th>Email</th>
                <th>Status</th>
                <th className="pe-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {orgs.map((org) => (
                <tr key={org.id}>
                  <td className="ps-4 fw-semibold">{org.name}</td>
                  <td style={{ color: "var(--color-text-secondary)" }}>{org.email}</td>
                  <td>
                    <span
                      className="badge px-2 py-1"
                      style={{
                        backgroundColor: org.status === "ACTIVE" ? "#16A34A" : "#DC2626",
                        color: "#fff",
                        fontWeight: 600,
                        fontSize: "11px",
                        borderRadius: "4px",
                      }}
                    >
                      {org.status}
                    </span>
                  </td>
                  <td className="pe-4">
                    <button
                      onClick={() => toggleBan(org.id)}
                      className="btn btn-sm border-0 fw-semibold px-3 py-1"
                      style={{
                        backgroundColor: org.status === "ACTIVE" ? "#FEE2E2" : "#DCFCE7",
                        color: org.status === "ACTIVE" ? "#DC2626" : "#16A34A",
                        fontSize: "12px",
                        borderRadius: "4px",
                      }}
                    >
                      {org.status === "ACTIVE" ? "Ban" : "Unban"}
                    </button>
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
