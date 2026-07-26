import { useNavigate } from "react-router-dom";
import { authFetch, getAccessToken, clearTokens, getUserRoles } from "../../../shared/auth";
import { useUserProfile } from "../../../shared/hooks/useUserProfile";
import { API } from "../../../shared/api";

interface MenuItem {
  label: string;
  path: string;
}

const PUBLIC_MENU: MenuItem[] = [
  { label: "Browse Events", path: "/customer/events" },
];

const ROLE_MENUS: Record<string, MenuItem[]> = {
  CUSTOMER: [
    { label: "Browse Events", path: "/customer/events" },
    { label: "My Tickets", path: "/customer/tickets" },
  ],
  ADMIN: [
    { label: "Dashboard", path: "/admin/dashboard" },
    { label: "Organizations", path: "/admin/organizations" },
    { label: "Approvals", path: "/admin/approvals" },
    { label: "Users", path: "/admin/users" },
    { label: "Logs", path: "/admin/logs" },
    { label: "Monitoring", path: "/admin/monitoring" },
  ],
  ORG_HEAD: [
    { label: "Dashboard", path: "/org/dashboard" },
    { label: "Events", path: "/org/events" },
    { label: "Create Event", path: "/org/events/create" },
    { label: "Venues", path: "/org/venues" },
    { label: "Organization", path: "/org/organization" },
    { label: "Team", path: "/org/team" },
    { label: "Analytics", path: "/org/analytics" },
    { label: "QR Validate", path: "/org/validate" },
    { label: "Refunds", path: "/org/refunds" },
  ],
  ORG_AGENT: [
    { label: "Events", path: "/org/events" },
    { label: "Create Event", path: "/org/events/create" },
    { label: "Venues", path: "/org/venues" },
    { label: "QR Validate", path: "/org/validate" },
  ],
  ORG_CONSUMER: [
    { label: "QR Validate", path: "/org/validate" },
  ],
};

function getInitials(name?: string, email?: string): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  }
  if (email) {
    const local = email.split("@")[0];
    if (!local) return "?";
    const p = local.split(/[._-]/);
    if (p.length >= 2) return (p[0][0] + p[1][0]).toUpperCase();
    return local.slice(0, 2).toUpperCase();
  }
  return "?";
}

function normaliseRole(raw: string): string {
  return raw.replace(/^ROLE_/, "");
}

function roleDisplay(raw: string): string {
  return normaliseRole(raw).replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

function collectMenuItems(roles: string[]): Map<string, MenuItem[]> {
  const map = new Map<string, MenuItem[]>();
  for (const raw of roles) {
    const key = normaliseRole(raw);
    const items = ROLE_MENUS[key];
    if (items && !map.has(key)) {
      map.set(key, items);
    }
  }
  return map;
}

interface SideDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function SideDrawer({ open, onClose }: SideDrawerProps) {
  const navigate = useNavigate();
  const token = getAccessToken();
  const { profile } = useUserProfile();
  const email = profile?.email ?? '';
  const name = profile?.name ?? '';
  const roles = getUserRoles();
  const menuItems = collectMenuItems(roles);

  const handleNavigate = (path: string) => {
    onClose();
    navigate(path);
  };

  const handleLogout = async () => {
    try {
      const access = getAccessToken();
      if (access) {
        await authFetch(API.auth.logout, { method: "POST" });
      }
    } catch {
      // ignore network errors on logout
    }
    clearTokens();
    onClose();
    navigate("/auth/login");
  };

  if (!token) return null;

  return (
    <>
      {open && (
        <div
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1040,
            backgroundColor: "rgba(0,0,0,0.4)",
          }}
        />
      )}

      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: "300px",
          maxWidth: "85vw",
          zIndex: 1050,
          backgroundColor: "#fff",
          transform: open ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.25s ease",
          display: "flex",
          flexDirection: "column",
          boxShadow: open ? "2px 0 12px rgba(0,0,0,0.15)" : "none",
        }}
      >
        <div className="d-flex align-items-center justify-content-between px-3 py-3 border-bottom">
          <span className="fw-bold" style={{ color: "var(--color-accent)", fontSize: "18px" }}>
            TicketSouq
          </span>
          <button
            onClick={onClose}
            className="btn p-0 border-0"
            style={{ fontSize: "22px", lineHeight: 1, color: "var(--color-text-secondary)" }}
          >
            ✕
          </button>
        </div>

        <div className="px-2 py-2 border-bottom">
          {PUBLIC_MENU.map((item) => (
            <button
              key={item.label}
              onClick={() => handleNavigate(item.path)}
              className="btn w-100 text-start px-3 py-2 border-0 rounded-1"
              style={{
                fontSize: "14px",
                color: "var(--color-text)",
                backgroundColor: "transparent",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f5f5f5")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="d-flex flex-column align-items-center py-4 px-3 border-bottom">
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              backgroundColor: "var(--color-accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "28px",
              fontWeight: 700,
              color: "#fff",
              marginBottom: "10px",
            }}
          >
            {getInitials(name || undefined, email || undefined)}
          </div>
          <span style={{ fontWeight: 600, fontSize: "15px", color: "var(--color-text)" }}>
            {name || email || "Unknown"}
          </span>
          {roles.length > 0 && (
            <div className="d-flex flex-wrap gap-1 mt-1">
              {roles.map((r) => (
                <span
                  key={r}
                  className="badge px-2 py-1"
                  style={{
                    backgroundColor: "var(--color-accent)",
                    color: "var(--color-text)",
                    fontWeight: 600,
                    fontSize: "11px",
                    borderRadius: "4px",
                  }}
                >
                  {roleDisplay(r)}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex-grow-1 overflow-auto px-2 py-2">
          {menuItems.size === 0 && (
            <p className="text-center px-3" style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>
              No role-specific options available.
            </p>
          )}
          {[...menuItems.entries()].map(([role, items]) => (
            <div key={role}>
              <div
                className="px-2 py-1"
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  color: "var(--color-text-secondary)",
                }}
              >
                {roleDisplay(role)}
              </div>
              {items.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleNavigate(item.path)}
                  className="btn w-100 text-start px-3 py-2 border-0 rounded-1"
                  style={{
                    fontSize: "14px",
                    color: "var(--color-text)",
                    backgroundColor: "transparent",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f5f5f5")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  {item.label}
                </button>
              ))}
            </div>
          ))}
        </div>

        <div className="border-top px-3 py-3">
          <button
            onClick={handleLogout}
            className="btn w-100 py-2 fw-semibold border-0 rounded-1"
            style={{
              backgroundColor: "#DC2626",
              color: "#fff",
              fontSize: "14px",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#B91C1C")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#DC2626")}
          >
            Logout
          </button>
        </div>
      </div>
    </>
  );
}
